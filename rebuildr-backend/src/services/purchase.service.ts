import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import {
  Purchase,
  PurchaseStatusEnum,
  SupportedPaymentMethod,
  TransportationEnum,
} from 'src/entities/purchase.entity';
import { User, UserType } from 'src/entities/user.entity';
import {
  Equal,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Or,
  Point,
  Repository,
} from 'typeorm';
import { RockerService } from './rocker.service';
import {
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from 'src/exceptions';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentRefunded,
  IPaymentStarted,
  IPayoutCompleted,
  IPayoutFailed,
  IPayoutStarted,
  IServiceFeeItem,
  PaymentStatusEnum,
  ServiceFeeItemNameEnum,
  Status1Enum,
} from 'src/apis/types/rocker-types';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { forwardRef, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { FileService } from './file.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  LatestPurchaseInput,
  MyPurchaseInput,
  MyPurchasesInput,
  PurchaseProductInput,
} from 'src/resolvers/purchase.resolver';
import { Review } from 'src/entities/review.entity';
import { ProductService } from './product.service';
import { provisionBase } from 'src/constants/pricing';
import { ShippingService } from './shipping.service';
import { SystemMessagesService } from './system-messages.service';
import { ReportPurchaseResolutionEnum } from 'src/entities/report-purchase.entity';
import { ReportPurchaseService } from './report-purchase.service';

export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rockerService: RockerService,
    private caslAbilityFactory: CaslAbilityFactory,
    private fileService: FileService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private shippingService: ShippingService,
    private systemMessagesService: SystemMessagesService,
    private reportPurchaseService: ReportPurchaseService,
  ) {}

  async getPurchase(id: string, currentUserId: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: { product: true },
    });

    if (!purchase) {
      throw BadUserInputException();
    }

    if (
      purchase.buyerId !== currentUserId &&
      purchase.product.sellerId !== currentUserId
    ) {
      throw ForbiddenException();
    }
    return purchase;
  }

  async createPurchase(
    input: PurchaseProductInput,
    currentUserId: string,
    logger: Logger,
  ) {
    logger.info({
      message: 'Creating purchase',
      paymentMethod: input.paymentMethod,
      shippingServicePointId: input.servicePointId,
      shippingProvider: input.shippingProvider,
      swishType: input.swishType,
      transportationMethod: input.transportationMethod,
    });
    const product = await this.productRepository.findOne({
      where: {
        id: input.productId,
        status: ProductStatus.PUBLISHED,
        purchases: [
          { status: PurchaseStatusEnum.FINISHED_FAILED },
          { status: IsNull() },
          {
            status: Or(
              Equal(PurchaseStatusEnum.CLAIMED),
              Equal(PurchaseStatusEnum.PAYMENT_STARTED),
            ),
            buyerId: currentUserId,
            // Allow for 4 minutes to complete payment, Rocker sets payments to expired after 5 minutes.
            createdAt: MoreThanOrEqual(dayjs().subtract(4, 'minute').toDate()),
          },
        ],
      },
      relations: {
        seller: true,
        purchases: true,
        images: true,
        shippingPrices: true,
      },
    });

    if (product) {
      logger.info({
        message: 'Product found',
        id: product.id,
        title: product.title,
        status: product.status,
        sellerId: product.sellerId,
      });
    }

    const allProductPurchases = await this.purchaseRepository.find({
      where: { productId: input.productId },
    });

    const isAlreadyPurchased = allProductPurchases?.some(
      ({ status }) => status !== PurchaseStatusEnum.FINISHED_FAILED,
    );

    const existingPurchase = product?.purchases.find(
      (p) =>
        (p.status === PurchaseStatusEnum.CLAIMED ||
          p.status === PurchaseStatusEnum.PAYMENT_STARTED) &&
        p.buyerId === currentUserId,
    );

    //if the product has a purchase that is not failed and is not in CLAIMED status by the same user that attempts to buy it, we should throw to prevent double purchases
    if (isAlreadyPurchased && !existingPurchase) {
      logger.error({
        message: 'Product already purchased',
        productId: product?.id,
        buyerId: currentUserId,
      });
      throw BadUserInputException('Product already purchased');
    }

    const buyer = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!buyer) {
      throw BadUserInputException();
    }
    if (buyer.type !== UserType.PERSONAL) {
      logger.error({
        message: 'Only private users can buy products',
        productId: product?.id,
        buyerId: buyer?.id,
        buyerType: buyer.type,
      });
      throw BadUserInputException('Only private users can buy products');
    }
    if (!product?.seller?.rockerUserId || !buyer.rockerUserId) {
      logger.error({
        message: 'User or seller not found',
        productId: product?.id,
        buyerId: buyer?.id,
        sellerId: product?.sellerId,
        buyerRockerUserId: buyer?.rockerUserId,
        sellerRockerUserId: product?.seller?.rockerUserId,
      });

      throw BadUserInputException();
    }

    if (existingPurchase && existingPurchase.rockerPaymentId) {
      logger.info({
        message: 'Existing purchase found',
        id: existingPurchase.id,
        status: existingPurchase.status,
        rockerPaymentId: existingPurchase.rockerPaymentId,
        rockerOfferId: existingPurchase.rockerOfferId,
        productId: existingPurchase.productId,
        buyerId: existingPurchase.buyerId,
        sellerId: product.sellerId,
        toServicePointId: existingPurchase.toServicePointId,
        shippingProvider: existingPurchase.shippingPrice.provider,
      });

      const existingPayment = await this.rockerService.getPayment(
        existingPurchase.rockerPaymentId,
      );

      if (existingPayment) {
        logger.info({
          message: 'Existing payment found',
          id: existingPayment.id,
          status: existingPayment.status,
          paymentMethod: existingPayment.paymentMethod,
          paymentMethodData: existingPayment.paymentMethodData,
        });
      }

      if (existingPayment.status !== PaymentStatusEnum.INIT) {
        logger.error({
          message: 'Payment is not in init state',
          id: existingPayment.id,
          status: existingPayment.status,
        });

        throw BadUserInputException('Payment is not in init state');
      }

      return {
        purchase: existingPurchase,
        product: product,
        swishToken: existingPayment.paymentMethodData?.token,
        reference: existingPayment.reference,
        trustlyUrl: existingPayment.paymentMethodData?.paymentUri,
      };
    }

    //Product is only available if its only purchases are failed ones
    const available = !product.purchases?.find(
      (p) => p.status !== PurchaseStatusEnum.FINISHED_FAILED,
    );

    if (!available) {
      logger.error({
        message: 'Product not available for purchase',
        productId: product.id,
      });
      throw InternalServerException('Product not available for purchase');
    }

    const selectedShippingPrice = product.shippingPrices.find(
      (shippingPrice) => shippingPrice.provider === input.shippingProvider,
    );

    const deliverToPoint: Point | undefined = input.deliverToLocation
      ? {
          type: 'Point',
          coordinates: [
            input.deliverToLocation.lat,
            input.deliverToLocation.lng,
          ],
        }
      : undefined;

    logger.info({
      message: 'Selected shipping price',
      id: selectedShippingPrice?.id,
      price: selectedShippingPrice?.price,
    });

    //-------------------- Verify Transportation Input ------------------------------
    if (
      input.transportationMethod === TransportationEnum.PICKUP &&
      !product.pickupEnabled
    ) {
      if (!product.shippingPrices.length) {
        logger.error({
          message: 'Seller does not offer pickup',
          productId: product.id,
        });
        throw BadUserInputException('Seller does not offer pickup');
      }
    }
    if (input.transportationMethod === TransportationEnum.SHIPPING) {
      if (!product.shippingPrices.length) {
        logger.error({
          message: 'Seller does not offer shipping',
          productId: product.id,
        });
        throw BadUserInputException('Seller does not offer shipping');
      }
      if (!selectedShippingPrice) {
        logger.error({
          message: 'Could not find shipping price',
          productId: product.id,
          shippingProvider: input.shippingProvider,
        });
        throw BadUserInputException('Could not find shipping option');
      }
      if (!input.servicePointId) {
        logger.error({
          message: 'Must choose a shipping service point',
          productId: product.id,
        });
        throw BadUserInputException('Must choose a shipping service point');
      }
    }
    if (input.transportationMethod === TransportationEnum.DELIVERY) {
      if (!product.deliveryEnabled) {
        logger.error({
          message: 'Seller does not offer delivery',
          productId: product.id,
        });
        throw BadUserInputException('Seller does not offer delivery');
      }
      if (!input.deliverToLocation) {
        logger.error({
          message: 'Must specify where to deliver',
          productId: product.id,
        });
        throw BadUserInputException('Must specify where to deliver');
      }

      const distance = await this.productService.distanceToProduct(
        deliverToPoint,
        input.productId,
      );
      const isTooFar = distance > product.deliveryRadius;
      if (isTooFar) {
        logger.error({
          message: 'Product is too far away for delivery',
          productId: product.id,
          productLocation: product.addressLocation,
          deliverToLocation: input.deliverToLocation,
        });
        throw BadUserInputException('Product is too far away for delivery');
      }
    }
    //-----------------------------------------------------------------

    const purchase = new Purchase();
    const shippingPrice = selectedShippingPrice?.price ?? 0;
    const provision = this.calculateProvision(product.price);
    const escrow = product.price - provision;
    const fee = provision + shippingPrice;
    const isFree = escrow + fee === 0;

    if (!input.paymentMethod && !isFree) {
      throw BadUserInputException('Payment method missing');
    }

    const imageUrls = await Promise.all(
      product.images.map(async (image) => {
        return await this.fileService.getUrl(image);
      }),
    );

    const generateOffer = async () => {
      if (!product.seller.rockerUserId) {
        logger.error({
          message: 'Seller has no rocker user id',
          productId: product.id,
          sellerId: product.sellerId,
        });

        throw BadUserInputException('Seller not found');
      }
      const feeItems: IServiceFeeItem[] = [
        {
          name: ServiceFeeItemNameEnum.SHIPPING_FEE,
          value: {
            currency: 'SEK',
            unit: 'MINOR',
            amount: shippingPrice,
          },
        },
        {
          name: ServiceFeeItemNameEnum.ESCROW_FEE,
          value: {
            currency: 'SEK',
            unit: 'MINOR',
            amount: provision,
          },
        },
      ];

      const rockerOffer = await this.rockerService.createOffer(
        product.title,
        product.id,
        product.seller.rockerUserId,
        escrow,
        fee,
        feeItems,
        imageUrls,
      );

      logger.info({
        message: 'Offer created',
        id: rockerOffer.id,
        price: rockerOffer.price,
      });

      return rockerOffer;
    };

    const generatePayment = async (offerId: string) => {
      if (!buyer.rockerUserId) {
        logger.error({
          message: 'Buyer has no rocker user id',
          productId: product.id,
          buyerId: buyer.id,
        });

        throw BadUserInputException('Buyer not found');
      }

      const rockerPayment = await this.rockerService.createPayment({
        offerId,
        buyerId: buyer.rockerUserId,
        paymentMethod: input.paymentMethod,
        swishPaymentType: input.swishType,
        successUri: input.successUrl,
        failureUri: input.failureUrl,
      });

      logger.info({
        message: 'Payment created',
        id: rockerPayment.id,
        status: rockerPayment.status,
      });
      return rockerPayment;
    };

    let offer: Awaited<ReturnType<typeof generateOffer>> | undefined;
    let payment: Awaited<ReturnType<typeof generatePayment>> | undefined;
    if (!isFree) {
      offer = await generateOffer();
      payment = await generatePayment(offer.id);
      purchase.rockerOfferId = offer?.id;
      purchase.rockerPaymentId = payment?.id;
    }

    purchase.toServicePointId = input.servicePointId;
    purchase.deliverToAddress = input.deliverToAddress;
    purchase.deliverToLocation = deliverToPoint;

    purchase.buyer = buyer;
    purchase.product = product;
    purchase.shippingPrice = selectedShippingPrice;
    purchase.transportationMethod = input.transportationMethod;
    purchase.paymentMethod = input.paymentMethod;

    if (
      (process.env.NODE_ENV === 'development' &&
        input.paymentMethod === SupportedPaymentMethod.SWISH) ||
      isFree
    ) {
      purchase.paymentAcceptedAt = new Date();
      purchase.paymentStartedAt = new Date();
      this.systemMessagesService.purchaseWithHandoffBuyer(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        purchase,
        true,
      );
      this.systemMessagesService.purchaseWithHandoffSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        purchase,
        true,
      );
    }
    const savedPurchase = await this.purchaseRepository.save(purchase);
    product.status = ProductStatus.SOLD;
    const savedProduct = this.productRepository.save(product);

    logger.info({
      message: 'Purchase created',
      id: savedPurchase.id,
      status: savedPurchase.status,
    });

    return {
      purchase: savedPurchase,
      product: savedProduct,
      swishToken: payment?.paymentMethodData?.token,
      reference: payment?.reference,
      trustlyUrl: payment?.paymentMethodData?.paymentUri,
    };
  }

  calculateProvision(price: number) {
    return Math.round(price * provisionBase);
  }

  //If seller has written a message to buyer, we record it here
  async handleSellerResponse(
    productId: string,
    senderId: string,
    receiverId: string,
  ) {
    const purchase = await this.purchaseRepository.findOne({
      where: [
        {
          productId: productId,
          buyerId: senderId,
          status: Not(PurchaseStatusEnum.FINISHED_FAILED),
        },
        {
          productId: productId,
          buyerId: receiverId,
          status: Not(PurchaseStatusEnum.FINISHED_FAILED),
        },
      ],
      relations: { buyer: true, product: { seller: true } },
    });
    if (purchase && !purchase.sellerRespondedAt) {
      const boughtForFree = await this.boughtForFree(purchase);
      const responseDate = new Date();
      this.systemMessagesService.sellerRespondedBuyer(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        responseDate,
        purchase,
        boughtForFree,
      );
      this.systemMessagesService.sellerRespondedSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        responseDate,
        purchase,
        boughtForFree,
      );
      purchase.sellerRespondedAt = responseDate;
      this.purchaseRepository.save(purchase);
    }
  }

  async latestPurchase(input: LatestPurchaseInput, currentUserId: string) {
    return await this.purchaseRepository.findOne({
      where: {
        product: {
          id: input.productId,
        },
        buyerId: In([input.otherUserId, currentUserId]),
        status: Not(
          In([
            PurchaseStatusEnum.FINISHED_FAILED,
            PurchaseStatusEnum.FINISHED_SUCCESS,
          ]),
        ),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async myPurchase(input: MyPurchaseInput, currentUserId: string) {
    return await this.purchaseRepository.findOne({
      where: { productId: input.productId, buyerId: currentUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async myPurchases(input: MyPurchasesInput, currentUserId: string) {
    let findOption: FindOptionsWhere<Purchase> | FindOptionsWhere<Purchase>[];
    const buyerOption = { buyerId: currentUserId };
    const sellerOption = { product: { sellerId: currentUserId } };

    if (!input.myRole) {
      findOption = [buyerOption, sellerOption];
    }
    if (input.myRole === 'buyer') {
      findOption = buyerOption;
    }
    if (input.myRole === 'seller') {
      findOption = sellerOption;
    }
    return await this.purchaseRepository.find({
      where: findOption,
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Marks a product as delivered. Only the seller can manually do this
   * and it is only allowed when the transportation method is NOT shipping.
   * @param purchaseId
   * @param buyerId
   * @param logger
   * @returns
   */
  async markAsDelivered(
    purchaseId: string,
    currentUserId: string,
    logger: Logger,
  ) {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        id: purchaseId,
        buyerId: Not(currentUserId), //currentUser can't be the buyer
        status: PurchaseStatusEnum.PAYMENT_ACCEPTED, //payment must be accepted
        shippingPriceId: IsNull(), //cant be shipping
      },
      relations: {
        buyer: true,
        product: { seller: true },
      },
    });

    if (!purchase) {
      logger.error('MarkAsDelivered: Purchase invalid', {
        purchaseId: purchaseId,
        buyerId: purchase.buyerId,
        currentUserId,
      });

      throw BadUserInputException('Purchase invalid');
    }

    const boughtForFree = await this.boughtForFree(purchase);
    if (!purchase.deliveredAt && !boughtForFree) {
      this.systemMessagesService.handoffConfirmedBuyer(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
      );
      this.systemMessagesService.handoffConfirmedSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
      );
    }
    purchase.deliveredAt = new Date();

    //Approve step is skipped if purchase was bought for free since approving or not approving
    //is there as a financial security
    if (!purchase.approvedAt && boughtForFree) {
      this.systemMessagesService.purchaseSuccessBuyer(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        true,
      );
      this.systemMessagesService.purchaseSuccessSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        true,
      );
      purchase.approvedAt = new Date();
    }
    const savedPurchase = await this.purchaseRepository.save(purchase);

    logger.info('MarkAsDelivered', {
      purchaseId: savedPurchase.id,
    });

    return savedPurchase;
  }

  isShipping(purchase: Purchase) {
    return !!purchase.shippingPriceId;
  }

  async reviews(purchase: Purchase) {
    return await this.reviewRepository.find({
      where: { purchaseId: purchase.id },
    });
  }

  async boughtForFree(purchase: Purchase) {
    const product = await this.productRepository.findOne({
      where: { id: purchase.productId },
    });
    if (!product) {
      return false;
    }

    if (!product.isGiveaway) {
      return false;
    }
    if (purchase.transportationMethod === TransportationEnum.PICKUP) {
      return true;
    }
    if (
      purchase.transportationMethod === TransportationEnum.DELIVERY &&
      product.deliveryPrice === 0
    ) {
      return true;
    }
    return false;
  }

  /**
   * A purchase can only be reported if it has been delivered but not yet approved
   */
  canReport(purchase: Purchase) {
    return purchase.status === PurchaseStatusEnum.DELIVERED;
  }

  async deleteMany(purchases: Purchase[]) {
    return await Promise.all(
      purchases.map((purchase) => this.delete(purchase.id)),
    );
  }

  async delete(id: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
    });
    return this.purchaseRepository.remove(purchase);
  }

  /**
   * Cancels a Purchase with an ongoing payment. This can only be done if the payment is in progress and not completed yet.
   * Will cancel the payment at Rocker and fail the purchase.
   * @param id Id of purchase
   * @param currentUserId User id of buyer
   */
  async cancelPurchase(id: string, currentUserId: string) {
    const purchase = await this.purchaseRepository.findOneBy({ id });
    if (
      !purchase ||
      (purchase.status !== PurchaseStatusEnum.CLAIMED &&
        purchase.status !== PurchaseStatusEnum.PAYMENT_STARTED)
    ) {
      throw BadUserInputException();
    }
    if (purchase.buyerId !== currentUserId) {
      throw ForbiddenException();
    }
    this.logger.info('Cancelling purchase', {
      purchaseId: purchase.id,
      paymentId: purchase.rockerPaymentId,
    });
    if (!purchase.rockerPaymentId) {
      throw InternalServerException('Missing paymentId');
    }
    await this.rockerService.cancelPayment(purchase.rockerPaymentId);
    return true;
  }
  /**
   * Aborts a purchase. This can only be done when a payment has been accepted but has not yet proceeded further.
   * Will refund the money back to the buyer.
   * @param id Id of purchase
   * @param currentUserId User id of buyer or seller
   */
  async abortPurchase(id: string, currentUserId: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: { product: { seller: true }, buyer: true },
    });
    if (!purchase) {
      throw BadUserInputException();
    }
    this.logger.info('Aborting purchase', {
      purchaseId: purchase.id,
      paymentId: purchase.rockerPaymentId,
      userId: currentUserId,
    });
    if (
      purchase.buyerId !== currentUserId &&
      purchase.product.sellerId !== currentUserId
    ) {
      throw ForbiddenException();
    }

    if (
      purchase.transportationMethod === TransportationEnum.SHIPPING &&
      purchase.status !== PurchaseStatusEnum.PAYMENT_ACCEPTED &&
      purchase.status !== PurchaseStatusEnum.SHIPMENT_BOOKED
    ) {
      this.logger.error('Aborting purchase error', {
        purchaseId: purchase.id,
        paymentId: purchase.rockerPaymentId,
        userId: currentUserId,
        status: purchase.status,
        transportationMethod: purchase.transportationMethod,
      });
      throw BadUserInputException();
    }
    if (
      (purchase.transportationMethod === TransportationEnum.DELIVERY ||
        purchase.transportationMethod === TransportationEnum.PICKUP) &&
      purchase.status !== PurchaseStatusEnum.PAYMENT_ACCEPTED
    ) {
      this.logger.error('Aborting purchase error', {
        purchaseId: purchase.id,
        paymentId: purchase.rockerPaymentId,
        userId: currentUserId,
        status: purchase.status,
        transportationMethod: purchase.transportationMethod,
      });
      throw BadUserInputException();
    }

    const abortedByBuyer = currentUserId === purchase.buyerId;

    const boughtForFree = await this.boughtForFree(purchase);
    if (!boughtForFree) {
      if (!purchase.rockerPaymentId) {
        throw InternalServerException('Missing paymentId');
      }
      await this.rockerService.refundPayment(
        purchase.rockerPaymentId,
        'Refunded by User action ' + abortedByBuyer ? '(buyer)' : '(seller)',
      );
    }
    if (!purchase.abortedById) {
      if (abortedByBuyer) {
        this.systemMessagesService.purchaseAbortedByBuyerBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          boughtForFree,
        );
        this.systemMessagesService.purchaseAbortedByBuyerSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          boughtForFree,
        );
      } else {
        this.systemMessagesService.purchaseAbortedBySellerBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          boughtForFree,
        );
        this.systemMessagesService.purchaseAbortedBySellerSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          boughtForFree,
        );
      }
    }
    purchase.product.status = ProductStatus.PUBLISHED;
    await this.productRepository.save(purchase.product);

    purchase.failedAt = new Date();
    purchase.abortedById = currentUserId;
    return await this.purchaseRepository.save(purchase);
  }

  //----------- PAUSE functions -----------------------
  async canPause(purchase: Purchase) {
    const pauseableStatus = ![
      PurchaseStatusEnum.PAUSED,
      PurchaseStatusEnum.APPROVED,
      PurchaseStatusEnum.PAYOUT_STARTED,
      PurchaseStatusEnum.FINISHED_FAILED,
      PurchaseStatusEnum.FINISHED_SUCCESS,
    ].includes(purchase.status);

    return purchase.paymentAcceptedAt && pauseableStatus;
  }
  async pausePaymentByRocker(paymentId: string, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: paymentId },
      relations: { product: true },
    });

    if (!purchase) {
      logger.error('PausePaymentByRocker: Purchase not found', {
        paymentId: paymentId,
      });
      throw NotFoundException('Purchase not found');
    }

    if (purchase.pausedAt) {
      logger.error('PausePaymentByRocker: Purchase already paused', {
        purchaseId: purchase.id,
        paymentId,
      });
      return;
    }

    logger.info('PausePaymentByRocker: Pausing purchase', {
      purchaseId: purchase.id,
      buyerId: purchase.buyerId,
    });

    purchase.pausedAt = new Date();
    const savedPurchase = await this.purchaseRepository.save(purchase);

    return savedPurchase;
  }
  async pausePurchaseByBuyer(
    purchaseId: string,
    buyerId: string,
    logger: Logger,
  ) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: { product: { seller: true }, buyer: true },
    });

    if (!purchase) {
      logger.error('PausePurchase: Purchase invalid', {
        purchaseId: purchaseId,
        buyerId: buyerId,
      });

      throw BadUserInputException('Purchase invalid');
    }

    if (purchase.buyerId !== buyerId) {
      logger.error('PausePurchase: Buyer and purchase does not match', {
        purchaseId: purchaseId,
        buyerId: buyerId,
      });

      throw BadUserInputException('Buyer and purchase does not match');
    }

    if (!this.canPause(purchase)) {
      logger.info('PausePurchase: Purchase cannot be paused', {
        purchaseId: purchaseId,
        status: purchase.status,
      });

      throw BadUserInputException('Purchase cannot be paused');
    }

    logger.info('PausePurchase: Pausing purchase', {
      purchaseId: purchaseId,
      buyerId: buyerId,
    });

    purchase.pausedAt = new Date();
    const savedPurchase = await this.purchaseRepository.save(purchase);

    if (purchase.rockerPaymentId) {
      logger.info('PausePurchase: Pausing payment at Rocker', {
        purchaseId: purchaseId,
        buyerId: buyerId,
      });

      await this.rockerService.pausePayment(
        purchase.rockerPaymentId,
        'Payment paused by buyer with id: ' + purchase.buyerId,
      );
    }

    return savedPurchase;
  }
  async resumePaymentByRocker(paymentId: string, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: paymentId },
      relations: { reportPurchase: true },
    });

    if (!purchase) {
      logger.error('ResumePurchase: Purchase invalid', {
        paymentId: paymentId,
      });
      throw NotFoundException('Purchase invalid');
    }
    if (!purchase.pausedAt) {
      logger.error('ResumePaymentByRocker: Purchase already resumed', {
        purchaseId: purchase.id,
        paymentId,
      });
      return;
    }

    logger.info('ResumePaymentByRocker: Resuming purchase', {
      purchaseId: purchase.id,
      buyerId: purchase.buyerId,
    });

    if (purchase.reportPurchase && !purchase.reportPurchase.resolution) {
      logger.info('Resolving report as resumed', {
        reportId: purchase.reportPurchase.id,
        purchaseId: purchase.id,
      });
      await this.reportPurchaseService.resolveRepport(
        ReportPurchaseResolutionEnum.PROCEED,
        purchase.reportPurchase.id,
        logger,
      );
    }

    purchase.pausedAt = null;
    const savedPurchase = await this.purchaseRepository.save(purchase);

    return savedPurchase;
  }
  async resumePurchaseByBuyer(
    purchaseId: string,
    buyerId: string,
    logger: Logger,
  ) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: { product: true, buyer: true },
    });

    if (!purchase) {
      logger.error('ResumePurchase: Purchase invalid', {
        purchaseId: purchaseId,
        buyerId: buyerId,
      });

      throw BadUserInputException('Purchase invalid');
    }

    if (purchase.buyerId !== buyerId) {
      logger.error('ResumePurchase: Buyer and purchase does not match', {
        purchaseId: purchaseId,
        buyerId: buyerId,
      });

      throw BadUserInputException('Buyer and purchase does not match');
    }

    logger.info('ResumePurchase: Resuming purchase', {
      purchaseId: purchaseId,
      buyerId: buyerId,
    });

    purchase.pausedAt = null;
    const savedPurchase = await this.purchaseRepository.save(purchase);

    if (purchase.rockerPaymentId) {
      logger.info('ResumePurchase: Resuming payment at Rocker', {
        purchaseId: purchaseId,
        buyerId: buyerId,
        paymentId: purchase.rockerPaymentId,
      });

      await this.rockerService.resumePayment(
        purchase.rockerPaymentId,
        'Payment resumed',
      );
    }

    return savedPurchase;
  }
  //-------------------------------------------------

  //----------------- ACCEPT PURCHASE functions ------------------
  //Product of purchase is accepted. Payment is confirmed and payout is started
  private async acceptPurchase(
    purchase: Purchase,
    buyer: User,
    seller: User,
    product: Product,
    logger: Logger,
  ) {
    if (
      ![
        PurchaseStatusEnum.DELIVERED,
        PurchaseStatusEnum.APPROVED,
        PurchaseStatusEnum.PAYOUT_FAILED,
      ].includes(purchase.status)
    ) {
      logger.error('Accepting purchase with wrong status', {
        purchaseId: purchase.id,
        status: purchase.status,
      });

      throw BadUserInputException();
    }
    if (!purchase.rockerPaymentId) {
      logger.error('Accepting purchase with no rockerPaymentId', {
        purchaseId: purchase.id,
      });

      throw BadUserInputException();
    }
    await this.rockerService.confirmPayment(purchase.rockerPaymentId);
    if (!purchase.approvedAt) {
      this.systemMessagesService.purchaseSuccessBuyer(buyer, seller, product);
      purchase.approvedAt = new Date();
    }

    await this.purchaseRepository.save(purchase);

    if (!seller.selectedPayoutMethod) {
      logger.error('Seller has no selected payout method', {
        purchaseId: purchase.id,
        userId: seller.id,
      });

      throw InternalServerException('Seller has no selected payout method');
    }
    try {
      logger.info('Trying to create payout', {
        purchaseId: purchase.id,
        sellerId: seller.id,
        buyerId: buyer.id,
        payoutMethod: seller.selectedPayoutMethod,
      });
      const payoutResponse = await this.rockerService.createPayout(
        purchase.rockerPaymentId,
        seller,
        logger,
      );

      purchase.rockerPayoutId = payoutResponse.id;
      purchase.payoutStartedAt = new Date();

      //In case the response completes immiediately, we won't have to wait for a webhook
      //to complete the purchase
      if (payoutResponse.status === Status1Enum.COMPLETED) {
        logger.info('Payout completed (inside acceptPurchase method)', {
          purchaseId: purchase.id,
          payoutId: payoutResponse.id,
          sellerId: seller.id,
          buyerId: buyer.id,
        });
        purchase.payoutReceivedAt = new Date();
        await this.productRepository.update(
          { id: purchase.productId },
          { status: ProductStatus.SOLD },
        );
      }
    } catch (err) {
      logger.error(
        'Error when creating payout. Error message: ' + JSON.stringify(err),
      );
      await this.purchaseRepository.update(
        { id: purchase.id },
        { payoutFailedAt: new Date() },
      );
    }

    return await this.purchaseRepository.save(purchase);
  }
  async manualAcceptPurchase(purchaseId: string, userId: string) {
    const logger = this.logger.child({
      requestId: crypto.randomUUID(),
    });
    logger.info('Manually accepting purchase');
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const purchase = await this.purchaseRepository.findOne({
      where: {
        id: purchaseId,
        failedAt: IsNull(),
        pausedAt: IsNull(),
        payoutReceivedAt: IsNull(),
      },
      relations: {
        buyer: true,
        product: { seller: true },
      },
    });

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', purchase)) {
      throw ForbiddenException();
    }
    return await this.acceptPurchase(
      purchase,
      purchase.buyer,
      purchase.product.seller,
      purchase.product,
      logger,
    );
  }
  //---------------------------------------------------------------

  //------------------ CRON jobs ----------------------------
  //Every hour, accept purchases that are waiting approval from
  //the buyer
  @Cron(CronExpression.EVERY_HOUR)
  async autoAcceptPurchases() {
    const logger = this.logger.child({
      cron: 'autoAcceptPurchases',
      requestId: crypto.randomUUID(),
    });
    logger.info('Auto accepting purchases');
    const dueTime = dayjs().add(1, 'day');
    const duePurchases = await this.purchaseRepository.find({
      where: {
        deliveredAt: LessThanOrEqual(dueTime.toDate()),
        failedAt: IsNull(),
        pausedAt: IsNull(),
        payoutReceivedAt: IsNull(),
      },
      relations: {
        buyer: true,
        product: { seller: true },
      },
    });
    await Promise.all(
      duePurchases.map((p) => {
        return this.acceptPurchase(
          p,
          p.buyer,
          p.product.seller,
          p.product,
          logger,
        );
      }),
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refundSellerNotResponded() {
    const logger = this.logger.child({
      cron: 'refundSellerNotResponded',
      requestId: crypto.randomUUID(),
    });
    logger.info('Refunding purchases where seller has not responded');
    const duePurchases = await this.purchaseRepository.find({
      where: {
        paymentAcceptedAt: LessThanOrEqual(dayjs().subtract(1, 'day').toDate()),
        status: PurchaseStatusEnum.PAYMENT_ACCEPTED,
        sellerRespondedAt: IsNull(),
        transportationMethod: Or(
          Equal(TransportationEnum.DELIVERY),
          Equal(TransportationEnum.PICKUP),
        ),
      },
      relations: {
        buyer: true,
        product: { seller: true },
      },
    });
    await Promise.all(
      duePurchases.map(async (purchase) => {
        logger.info('Refunding purchase due to seller not responding', {
          purchaseId: purchase.id,
          buyerId: purchase.buyer.id,
          sellerId: purchase.product.seller.id,
          productId: purchase.product.id,
        });
        const boughtForFree = await this.boughtForFree(purchase);

        if (!boughtForFree) {
          if (!purchase.rockerPaymentId) {
            logger.error('Purchase is missing paymentId and is not for free');
            return;
          }
          await this.rockerService.refundPayment(
            purchase.rockerPaymentId,
            'Refunded by System due to no response from Seller',
          );
        }

        if (!purchase.failedAt) {
          this.systemMessagesService.purchaseAbortedBySellerBuyer(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
            boughtForFree,
          );
          this.systemMessagesService.purchaseAbortedBySellerSeller(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
            boughtForFree,
          );
        }

        if (boughtForFree) {
          purchase.product.status = ProductStatus.PUBLISHED;
          await this.productRepository.save(purchase.product);
          purchase.failedAt = new Date();
          return await this.purchaseRepository.save(purchase);
        }

        return purchase;
      }),
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refundPackageNotDroppedOff() {
    const logger = this.logger.child({
      cron: 'redundPackageNotDroppedOff',
      requestId: crypto.randomUUID(),
    });
    logger.info(
      'Refunding purchases where seller has not dropped off package in time',
    );
    const duePurchases = await this.purchaseRepository.find({
      where: {
        paymentAcceptedAt: LessThanOrEqual(dayjs().subtract(7, 'day').toDate()),
        status: Or(
          Equal(PurchaseStatusEnum.SHIPMENT_BOOKED),
          Equal(PurchaseStatusEnum.PAYMENT_ACCEPTED),
        ),
        transportationMethod: TransportationEnum.SHIPPING,
      },
      relations: {
        buyer: true,
        product: { seller: true },
      },
    });
    await Promise.all(
      duePurchases.map(async (purchase) => {
        logger.info(
          'Refunding purchase due to seller not dropping off package in time',
          {
            purchaseId: purchase.id,
            buyerId: purchase.buyer.id,
            sellerId: purchase.product.seller.id,
            productId: purchase.product.id,
            shippingId: purchase.shippingId,
          },
        );
        if (!purchase.rockerPaymentId) {
          return;
        }
        await this.rockerService.refundPayment(
          purchase.rockerPaymentId,
          'Refunded by System due to shipment not being dropped off in time',
        );
        if (!purchase.failedAt) {
          this.systemMessagesService.lateShippingDropOffBuyer(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
          );
          this.systemMessagesService.lateShippingDropOffSeller(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
          );
        }

        return purchase;
      }),
    );
  }

  //---------------------------------------------------------------

  //--------------- WEBHOOK functions ----------------------
  async paymentStarted(payload: IPaymentStarted, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
    });

    if (!purchase) {
      logger.error('PaymentStarted: No purchase found', {
        paymentId: payload.paymentId,
      });

      throw new Error(
        'PaymentStarted: No purchase found with id: ' + payload.paymentId,
      );
    }

    purchase.paymentStartedAt = new Date(payload.timestamp);
    await this.purchaseRepository.save(purchase);

    logger.info('Payment started', {
      paymentId: payload.paymentId,
      purchaseId: purchase.id,
    });
  }
  async paymentCompleted(payload: IPaymentCompleted, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });

    if (!purchase) {
      logger.error('PaymentCompleted: No purchase found', {
        paymentId: payload.paymentId,
      });

      throw new Error(
        'PaymentCompleted: No purchase found with id: ' + payload.paymentId,
      );
    }

    if (!purchase.paymentAcceptedAt) {
      purchase.paymentAcceptedAt = new Date(payload.timestamp);

      //System messages
      if (purchase.transportationMethod === TransportationEnum.SHIPPING) {
        this.systemMessagesService.purchaseWithShippingBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
        );
        this.systemMessagesService.purchaseWithShippingSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          purchase.shippingPrice?.provider,
        );
      } else {
        this.systemMessagesService.purchaseWithHandoffBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
        );
        this.systemMessagesService.purchaseWithHandoffSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
        );
      }
    }

    await this.purchaseRepository.save(purchase);

    if (purchase.transportationMethod === TransportationEnum.SHIPPING) {
      logger.info({
        message:
          'Accepting payment of purchase with tranportation method SHIPPING',
        purchaseId: purchase.id,
        buyerId: purchase.buyerId,
      });
      this.shippingService.bookShipping(purchase.id, logger);
    }

    logger.info('Payment completed', {
      paymentId: payload.paymentId,
      purchaseId: purchase.id,
    });
  }
  async paymentFailed(payload: IPaymentFailed, logger: Logger) {
    logger.info('Payment failed', {
      paymentId: payload.paymentId,
    });
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });

    if (!purchase) {
      logger.error('PaymentFailed: No purchase found', {
        paymentId: payload.paymentId,
      });
      throw new Error(
        'PaymentFailed: No purchase found with id: ' + payload.paymentId,
      );
    }
    await this.productRepository.update(
      { id: purchase.productId },
      { status: ProductStatus.PUBLISHED },
    );
    await this.purchaseRepository.remove(purchase);
    if (purchase.rockerOfferId) {
      this.rockerService.deleteOffer(purchase.rockerOfferId);
    }
  }
  async paymentRefunded(payload: IPaymentRefunded, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
      relations: { reportPurchase: true },
    });
    if (!purchase) {
      return;
    }

    //This purchase has an active report. Resolve it and unpause the purchase
    if (purchase.reportPurchase && !purchase.reportPurchase.resolution) {
      logger.info('Resolving report as refunded', {
        reportId: purchase.reportPurchase.id,
        purchaseId: purchase.id,
      });
      await this.reportPurchaseService.resolveRepport(
        ReportPurchaseResolutionEnum.REFUND,
        purchase.reportPurchase.id,
        logger,
      );
      purchase.pausedAt = null;
    }
    await this.productRepository.update(
      { id: purchase.productId },
      { status: ProductStatus.PUBLISHED },
    );
    purchase.failedAt = new Date(payload.timestamp);
    purchase.refundId = payload.refundId;
    await this.purchaseRepository.save(purchase);

    logger.info('Payment refunded', {
      paymentId: payload.paymentId,
      purchaseId: purchase.id,
    });
  }
  async payoutStarted(payload: IPayoutStarted, logger: Logger) {
    await this.purchaseRepository.update(
      { rockerPayoutId: payload.payoutId },
      { payoutStartedAt: new Date(payload.timestamp) },
    );

    logger.info('Payout started', {
      payoutId: payload.payoutId,
    });
  }
  async payoutComplete(payload: IPayoutCompleted, logger: Logger) {
    const purchase = await this.purchaseRepository.findOneOrFail({
      where: { rockerPayoutId: payload.payoutId },
      relations: { product: { seller: true }, buyer: true },
    });
    if (!purchase.payoutReceivedAt) {
      this.systemMessagesService.purchaseSuccessSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
      );
    }
    purchase.payoutReceivedAt = new Date(payload.timestamp);

    await Promise.all([
      this.purchaseRepository.save(purchase),
      this.productRepository.update(
        { id: purchase.productId },
        { status: ProductStatus.SOLD },
      ),
    ]);

    logger.info('Payout completed (from webhook)', {
      payoutId: payload.payoutId,
      purchaseId: purchase.id,
      sellerId: purchase.product.sellerId,
      buyerId: purchase.buyerId,
    });
  }
  async payoutFailed(payload: IPayoutFailed, logger: Logger) {
    await this.purchaseRepository.update(
      { rockerPayoutId: payload.payoutId },
      { payoutFailedAt: new Date(payload.timestamp) },
    );

    logger.info('Payout failed', {
      payoutId: payload.payoutId,
    });
  }
  //------------------------------------------------------------
}
