import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import {
  Purchase,
  PurchaseStatusEnum,
  TransportationEnum,
} from 'src/entities/purchase.entity';
import { User, UserType } from 'src/entities/user.entity';
import {
  Equal,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  Not,
  Or,
  Point,
  Repository,
} from 'typeorm';
import {
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
} from 'src/exceptions';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  CmsListPurchasesInput,
  CmsListPurchasesResponse,
  LatestPurchaseInput,
  MyPurchaseInput,
  MyPurchasesInput,
  PurchaseProductInput,
} from 'src/resolvers/purchase.resolver';
import { Review } from 'src/entities/review.entity';
import { ProductService } from './product.service';
import { maximumProductPrice, provisionBase } from 'src/constants/pricing';
import { ShippingService } from './shipping.service';
import { SystemMessagesService } from './system-messages.service';
import { ReportPurchaseResolutionEnum } from 'src/entities/report-purchase.entity';
import { ReportPurchaseService } from './report-purchase.service';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { idFromObject } from 'src/utility/stripe/utils';
import { ShippingPriceService } from './shipping-price.service';
import { ShippingPrice } from 'src/entities/shipping-price.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private shippingService: ShippingService,
    private systemMessagesService: SystemMessagesService,
    private reportPurchaseService: ReportPurchaseService,
    private stripeService: StripeService,
    private shippingPriceService: ShippingPriceService,
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
      transportationMethod: input.transportationMethod,
    });
    const product = await this.productRepository.findOne({
      where: {
        id: input.productId,
        status: Or(Equal(ProductStatus.PUBLISHED), Equal(ProductStatus.SOLD)),
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
    } else {
      logger.error({
        message: 'Product not found',
        productId: product?.id,
        buyerId: currentUserId,
      });
      throw BadUserInputException('Product not found');
    }

    //Validate input
    if (input.purchasedQuantity && !product.soldByQuantity) {
      logger.error({
        message: 'Unexpected input, product does not allow partial purchase',
        product,
        input,
        buyerId: currentUserId,
    });
      throw BadUserInputException(
        'Unexpected input, product does not allow partial purchase',
      );
    }
    if (!input.purchasedQuantity && product.soldByQuantity) {
      logger.error({
        message:
          'Unexpected input, product sells partially but no quantity was given',
        product,
        input,
        buyerId: currentUserId,
      });
      throw BadUserInputException(
        'Unexpected input, product sells partially but no quantity was given',
      );
    }

    const isAvailable = product.primaryQuantity
      ? (input.purchasedQuantity ?? 1) <= product.primaryQuantity
      : false;

    const existingPurchase = product.purchases.find(
      (p) =>
        (p.status === PurchaseStatusEnum.CLAIMED ||
          p.status === PurchaseStatusEnum.PAYMENT_STARTED) &&
        p.buyerId === currentUserId,
    );

    if (!isAvailable && !existingPurchase) {
      logger.error({
        message: 'Product already purchased',
        productId: product?.id,
        buyerId: currentUserId,
        input,
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
    if (!product.seller.connectedAccountId) {
      logger.error({
        message: 'Seller does not have a payout account',
        productId: product?.id,
        buyerId: buyer?.id,
        sellerId: product?.sellerId,
      });

      throw InternalServerException();
    }

    if (existingPurchase && existingPurchase.paymentIntentId) {
      logger.info({
        message: 'Existing purchase found',
        id: existingPurchase.id,
        status: existingPurchase.status,
        paymentIntentId: existingPurchase.paymentIntentId,
        productId: existingPurchase.productId,
        buyerId: existingPurchase.buyerId,
        sellerId: product.sellerId,
        toServicePointId: existingPurchase.toServicePointId,
        shippingProvider: existingPurchase.shippingPrice?.provider,
      });

      if (input.purchasedQuantity !== existingPurchase.purchasedQuantity) {
        logger.error({
          message: 'Existing purchase has different purchaseQuantity',
          existingPurchase,
          input,
          currentUserId,
        });
        throw BadUserInputException('Product already purchased');
      }

      const existingPayment = await this.stripeService.retrievePayment(
        existingPurchase.paymentIntentId,
      );

      if (existingPayment) {
        logger.info({
          message: 'Existing payment found',
          id: existingPayment.id,
          status: existingPayment.status,
        });
      }

      if (existingPayment?.status !== 'requires_payment_method') {
        logger.error({
          message: 'Payment is not in init state',
          paymentIntentId: existingPayment.id,
          status: existingPayment.status,
        });
      } else {
        return {
          purchase: existingPurchase,
          product: product,
          reference: existingPayment.client_secret,
        };
      }
    }

    const deliverToPoint: Point | undefined = input.deliverToLocation
      ? {
          type: 'Point',
          coordinates: [
            input.deliverToLocation.lat,
            input.deliverToLocation.lng,
          ],
        }
      : undefined;

    //-------------------- Handle Transportation Input ------------------------------
    let shippingPrice: ShippingPrice;
    let deliveryPrice = 0;

    if (
      input.transportationMethod === TransportationEnum.PICKUP &&
      !product.pickupEnabled
    ) {
      logger.error({
        message: 'Seller does not offer pickup',
        productId: product.id,
      });
      throw BadUserInputException('Seller does not offer pickup');
    }
    if (input.transportationMethod === TransportationEnum.SHIPPING) {
      const shippingPriceByProvider = product.shippingPrices.find(
        (shippingPrice) => shippingPrice.provider === input.shippingProvider,
      );

      if (!product.shippingPrices.length) {
        logger.error({
          message: 'Seller does not offer shipping',
          productId: product.id,
        });
        throw BadUserInputException('Seller does not offer shipping');
      }
      if (!shippingPriceByProvider) {
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

      if (shippingPriceByProvider) {
        const shippingWeightForQuantity =
          shippingPriceByProvider.maxWeight * input.purchasedQuantity;
        const shippingPriceMatchingWeight =
          await this.shippingPriceService.shippingPriceMatchingWeight(
            shippingWeightForQuantity,
          );
        if (!shippingPriceMatchingWeight) {
          logger.error({
            message: 'Product with selected quantity is too heavy!',
            input,
            currentUserId,
          });
          throw BadUserInputException(
            'Product with quantity exceeds max weight',
          );
        }
        shippingPrice = shippingPriceMatchingWeight;
      }
    }
    if (input.transportationMethod === TransportationEnum.DELIVERY) {
      deliveryPrice = product.deliveryPrice ?? 0;
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

    const totalProductPrice = product.price * (input.purchasedQuantity ?? 1);

    const { escrow, fee, isFree } = PurchaseService.calculateSellSummary({
      productPrice: totalProductPrice,
      shippingPrice: shippingPrice?.price ?? 0,
      deliveryPrice,
    });

    const totalAmountToPay = escrow + fee;
    if (totalAmountToPay > maximumProductPrice) {
      throw BadUserInputException(
        'Total transaction value exceeds upper limit',
      );
    }

    if (!input.paymentMethod && !isFree) {
      throw BadUserInputException('Payment method missing');
    }

    let clientSecret = undefined;
    if (!isFree) {
      const paymentResponse = await this.stripeService.createPayment(
        product.seller.connectedAccountId,
        totalAmountToPay,
        fee,
        buyer,
        input.paymentMethod,
        product.title,
        {
          productId: product?.id,
          sellerId: product?.seller?.id,
        },
      );
      clientSecret = paymentResponse.clientSecret;
      purchase.paymentIntentId = paymentResponse.id;
    }

    purchase.purchasedQuantity = input.purchasedQuantity;
    purchase.toServicePointId = input.servicePointId;
    purchase.deliverToAddress = input.deliverToAddress;
    purchase.deliverToLocation = deliverToPoint;

    purchase.buyer = buyer;
    purchase.product = product;
    purchase.shippingPrice = shippingPrice;
    purchase.transportationMethod = input.transportationMethod;
    purchase.paymentMethod = input.paymentMethod;

    if (isFree) {
      purchase.paymentAcceptedAt = new Date();
      purchase.paymentStartedAt = new Date();
      this.systemMessagesService
        .purchaseWithHandoffBuyer(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        purchase,
        true,
        )
        .then(() =>
          this.systemMessagesService.purchaseWithHandoffSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        purchase,
        true,
          ),
      );
    }
    const savedPurchase = await this.purchaseRepository.save(purchase);

    product.primaryQuantity = product.primaryQuantity - input.purchasedQuantity;
    if (!product.primaryQuantity) {
    product.status = ProductStatus.SOLD;
    }
    product.purchases = [...product.purchases, savedPurchase];
    const savedProduct = await this.productRepository.save(product);

    logger.info({
      message: 'Purchase created',
      id: savedPurchase.id,
      status: savedPurchase.status,
    });

    return {
      purchase: savedPurchase,
      product: savedProduct,
      reference: clientSecret,
    };
  }

  static calculateSellSummary(input: {
    productPrice: number;
    shippingPrice: number;
    deliveryPrice: number;
  }) {
    const { productPrice, shippingPrice, deliveryPrice } = input;
    const provision = Math.round(productPrice * provisionBase);
    const escrow = productPrice - provision + deliveryPrice;
    const fee = provision + shippingPrice;
    const isFree = escrow + fee === 0;
    return {
      provision,
      /**
       * Amount of total received by seller
       */
      escrow,
      /**
       * Amount of total going to Rebuildr
       */
      fee,
      isFree,
    };
  }

  //If seller has written a message to buyer, we record it here
  async handleSellerResponse(purchaseId: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: [
        {
          id: purchaseId,
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
        status: Not(PurchaseStatusEnum.FINISHED_FAILED),
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
      where: { paymentAcceptedAt: Not(IsNull()), ...findOption },
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
        purchase,
      );
      this.systemMessagesService.handoffConfirmedSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        purchase,
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
        purchase,
        true,
      );
      this.systemMessagesService.purchaseSuccessSeller(
        purchase.buyer,
        purchase.product.seller,
        purchase.product,
        purchase,
        true,
      );
      purchase.approvedAt = new Date();
      purchase.payoutStartedAt = new Date();
      purchase.payoutReceivedAt = new Date();
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
   * Will cancel the payment at Stripe and fail the purchase.
   * @param id Id of purchase
   * @param currentUserId User id of buyer
   */
  async cancelPurchase(purchaseId: string, currentUserId: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: { product: true },
    });
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
      paymentIntentId: purchase.paymentIntentId,
    });
    if (!purchase.paymentIntentId) {
      throw InternalServerException('Missing paymentIntentId');
    }
    if (purchase.failedAt) {
      this.logger.info('Purchase already canceled or otherwise failed', {
        paymentIntentId: purchase.paymentIntentId,
      });
      return purchase;
    }
    await this.stripeService.cancelPayment(purchase.paymentIntentId);

    const product = this.returnPurchaseQuantity(purchase.product, purchase);
    await this.productRepository.save(product);

    purchase.failedAt = new Date();
    return await this.purchaseRepository.save(purchase);
  }
  /**
   * Aborts a purchase. This can only be done when a payment has been accepted but has not yet proceeded further.
   * Will refund the money back to the buyer.
   * @param id Id of purchase
   * @param currentUserId User id of buyer or seller
   */
  async abortPurchase(purchaseId: string, currentUserId: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: { product: { seller: true }, buyer: true },
    });
    if (!purchase) {
      throw BadUserInputException();
    }
    this.logger.info('Aborting purchase', {
      purchaseId: purchase.id,
      paymentIntentId: purchase.paymentIntentId,
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
        paymentIntentId: purchase.paymentIntentId,
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
        paymentIntentId: purchase.paymentIntentId,
        userId: currentUserId,
        status: purchase.status,
        transportationMethod: purchase.transportationMethod,
      });
      throw BadUserInputException();
    }

    const abortedByBuyer = currentUserId === purchase.buyerId;

    const boughtForFree = await this.boughtForFree(purchase);
    if (!boughtForFree) {
      if (!purchase.paymentIntentId) {
        throw InternalServerException('Missing paymentIntentId');
      }
      const refund = await this.stripeService.refundPayment(
        purchase.paymentIntentId,
        currentUserId,
      );
      purchase.refundId = refund.id;
    }
    if (!purchase.abortedById) {
      if (abortedByBuyer) {
        this.systemMessagesService.purchaseAbortedByBuyerBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          boughtForFree,
        );
        this.systemMessagesService.purchaseAbortedByBuyerSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          boughtForFree,
        );
      } else {
        this.systemMessagesService.purchaseAbortedBySellerBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          boughtForFree,
        );
        this.systemMessagesService.purchaseAbortedBySellerSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          boughtForFree,
        );
      }
    }

    const product = this.returnPurchaseQuantity(purchase.product, purchase);
    await this.productRepository.save(product);

    purchase.failedAt = new Date();
    purchase.abortedById = currentUserId;
    return await this.purchaseRepository.save(purchase);
  }

  //----------------- UTIL functions -----------------------------
  returnPurchaseQuantity(product: Product, purchase: Purchase) {
    this.logger.info({
      message: 'returning quantity to product',
      currentQuantity: product.primaryQuantity,
      returningQuantity: purchase.purchasedQuantity,
      productId: product.id,
      purchaseId: purchase.id,
    });
    product.primaryQuantity =
      product.primaryQuantity + purchase.purchasedQuantity;
    if (product.primaryQuantity) {
      product.status = ProductStatus.PUBLISHED;
    }
    return product;
  }
  //--------------------------------------------------------------

  //----------------- ACCEPT PURCHASE functions ------------------
  //Product of purchase is accepted. Payment is confirmed and payout is started
  private async acceptPurchase(
    purchase: Purchase,
    buyer: User,
    seller: User,
    product: Product,
    logger: Logger,
  ) {
    if (![PurchaseStatusEnum.DELIVERED].includes(purchase.status)) {
      logger.error('Accepting purchase with wrong status', {
        purchaseId: purchase.id,
        status: purchase.status,
      });

      throw BadUserInputException();
    }
    if (!purchase.paymentIntentId) {
      logger.error('Accepting purchase with no paymentIntentId', {
        purchaseId: purchase.id,
      });

      throw BadUserInputException();
    }
    if (!purchase.approvedAt) {
      const nrOfCompletedSales = await this.purchaseRepository.count({
        where: {
          payoutReceivedAt: Not(null),
          product: {
            seller: {
              id: purchase.product.seller.id,
            },
          },
        },
      });
      await this.systemMessagesService.purchaseSuccessBuyer(
        buyer,
        seller,
        product,
        purchase,
      );
      await this.systemMessagesService.purchaseSuccessSeller(
        buyer,
        seller,
        product,
        purchase,
        nrOfCompletedSales > 0,
      );
    }
    purchase.approvedAt = new Date();

    const approvedPurchase = await this.purchaseRepository.save(purchase);

    if (!seller.connectedAccountId) {
      logger.error('Seller has no connected account', {
        purchaseId: approvedPurchase.id,
        userId: seller.id,
      });

      throw InternalServerException('Seller has no connected account');
    }
    try {
      logger.info('Trying to create payout', {
        purchaseId: approvedPurchase.id,
        sellerId: seller.id,
        buyerId: buyer.id,
      });
      const payoutAvailable = await this.stripeService.payoutAvailable(
        seller.connectedAccountId,
        approvedPurchase.paymentIntentId,
      );
      if (!payoutAvailable) {
        logger.info(
          'Seller does not have available funds for payout yet. Will try again later',
        );
      } else {
        const payoutResponse = await this.stripeService.createPayout(
          seller.connectedAccountId,
          approvedPurchase.paymentIntentId,
        );

        approvedPurchase.payoutId = payoutResponse.id;
      }
    } catch (err) {
      logger.error(
        'Error when creating payout. Error message: ' + JSON.stringify(err),
      );
      await this.purchaseRepository.update(
        { id: approvedPurchase.id },
        { payoutFailedAt: new Date() },
      );
    }

    return await this.purchaseRepository.save(approvedPurchase);
  }
  async manualAcceptPurchase(purchaseId: string, userId: string) {
    const logger = this.logger.child({
      requestId: crypto.randomUUID(),
    });
    logger.info('Manually accepting purchase');
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

    if (!purchase) {
      throw BadUserInputException('Non eligable purchase');
    }

    if (purchase.buyerId !== userId) {
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
  //If a users starts a purchase but does not resolve it by completing it or finishing it then
  //we should cancel it after 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleIncompletePayments() {
    const logger = this.logger.child({
      cron: 'handleIncompletePayments',
      requestId: crypto.randomUUID(),
    });
    logger.info('Handling incomplete purchases');
    const dueTime = dayjs().add(30, 'minute');

    const incompletePurchases = await this.purchaseRepository.find({
      where: {
        status: PurchaseStatusEnum.PAYMENT_STARTED,
        paymentStartedAt: LessThanOrEqual(dueTime.toDate()),
      },
    });
    logger.info('Number of incomplete purchases', {
      nrOfIncompletePurchases: incompletePurchases.length,
    });

    await Promise.all(
      incompletePurchases.map(async (purchase) => {
        if (purchase.paymentIntentId) {
          const payment = await this.stripeService.retrievePayment(
            purchase.paymentIntentId,
          );
          switch (payment.status) {
            case 'processing':
              return;
            case 'canceled': {
              logger.info('Canceled purchase', {
                pruchaseId: purchase.id,
              });
              //Already canceled but not yet failed. This should be an off-case.
              //Purchase is failed and if its the only active purchase on the product, the product will be re-published
              purchase.failedAt = new Date();
              let product = await this.productRepository.findOne({
                where: { id: purchase.productId },
                relations: { purchases: true },
              });
              if (product) {
                product = this.returnPurchaseQuantity(product, purchase);
                product.status = ProductStatus.PUBLISHED;
                await this.productRepository.save(product);
              }
              return this.purchaseRepository.save(purchase);
            }
            case 'requires_action':
            case 'requires_capture':
            case 'requires_confirmation':
            case 'requires_payment_method':
              logger.info('Purchase required action', {
                purchaseId: purchase.id,
              });
              return this.stripeService.cancelPayment(purchase.paymentIntentId);
          }
        }
      }),
    );
  }
  //Every hour, accept purchases that are waiting approval from
  //the buyer
  @Cron(CronExpression.EVERY_HOUR)
  async autoAcceptPurchases() {
    const logger = this.logger.child({
      cron: 'autoAcceptPurchases',
      requestId: crypto.randomUUID(),
    });
    logger.info('Auto accepting purchases');
    const dueTime = dayjs().subtract(2, 'day');
    const duePurchases = await this.purchaseRepository.find({
      where: {
        deliveredAt: LessThanOrEqual(dueTime.toDate()),
        status: PurchaseStatusEnum.DELIVERED,
      },
      relations: {
        buyer: true,
        product: { seller: true },
      },
    });
    await Promise.all(
      duePurchases.map((p) => {
        try {
          return this.acceptPurchase(
            p,
            p.buyer,
            p.product.seller,
            p.product,
            logger,
          );
        } catch {
          logger.error('autoAcceptingPurchases: error accepting purchase', {
            purchaseId: p.id,
            purchaseStatus: p.status,
            productId: p.product.id,
            sellerId: p.product.seller.id,
            buyerId: p.buyer.id,
          });
        }
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
          if (!purchase.paymentIntentId) {
            logger.error('Purchase is missing paymentId and is not for free');
            return;
          }
          const refund = await this.stripeService.refundPayment(
            purchase.paymentIntentId,
          );
          purchase.refundId = refund.id;
        }

        if (!purchase.failedAt) {
          this.systemMessagesService.purchaseAbortedBySellerBuyer(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
            purchase,
            boughtForFree,
          );
          this.systemMessagesService.purchaseAbortedBySellerSeller(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
            purchase,
            boughtForFree,
          );
        }

        if (boughtForFree) {
          const product = this.returnPurchaseQuantity(
            purchase.product,
            purchase,
          );
          await this.productRepository.save(product);
        }
        purchase.failedAt = new Date();
        return await this.purchaseRepository.save(purchase);
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
        if (!purchase.paymentIntentId) {
          return;
        }
        const refund = await this.stripeService.refundPayment(
          purchase.paymentIntentId,
        );
        if (!purchase.failedAt) {
          this.systemMessagesService.lateShippingDropOffBuyer(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
            purchase,
          );
          this.systemMessagesService.lateShippingDropOffSeller(
            purchase.buyer,
            purchase.product.seller,
            purchase.product,
            purchase,
          );
        }
        purchase.refundId = refund.id;
        purchase.failedAt = new Date();
        return await this.purchaseRepository.save(purchase);
      }),
    );
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async automaticPayout() {
    const logger = this.logger.child({
      cron: 'automaticPayout',
      requestId: crypto.randomUUID(),
    });
    const approvedPurchases = await this.purchaseRepository.find({
      where: {
        status: PurchaseStatusEnum.APPROVED,
      },
      relations: { product: { seller: true } },
    });

    //Check which sellers has enough fund on their account for payout
    const availableResult = await Promise.allSettled(
      approvedPurchases.map(async (purchase) => {
        const accountId = purchase.product.seller.connectedAccountId;
        const paymentIntentId = purchase.paymentIntentId;
        if (!paymentIntentId) {
          logger.error('Purchase is missing paymentIntentId', {
            purchaseId: purchase.id,
          });
          purchase.failedAt = new Date();
          await this.purchaseRepository.save(purchase);
          throw new Error('Missing paymentIntentId');
        }
        if (!accountId) {
          logger.error('Seller is missing connected account id', {
            sellerId: purchase.product.seller.id,
          });
          return;
        }
        const payoutAvailable = await this.stripeService.payoutAvailable(
          purchase.product.seller.connectedAccountId,
          purchase.paymentIntentId,
        );
        return payoutAvailable ? purchase : undefined;
      }),
    );
    const purchasesAvailableForPayout = availableResult
      .filter((result) => result.status === 'fulfilled')
      .filter((purchaseOrUndefinedResult) => purchaseOrUndefinedResult.value)
      .map((purchaseResult) => purchaseResult.value);

    //Pay out the sellers
    try {
      await Promise.all(
        purchasesAvailableForPayout.map(async (purchase) => {
          try {
            const payout = await this.stripeService.createPayout(
              purchase.product.seller.connectedAccountId,
              purchase.paymentIntentId,
            );
            purchase.payoutId = payout.id;
            logger.info('Payed out purchase', {
              purchaseId: purchase.id,
              paymentIntentId: purchase.paymentIntentId,
              sellerId: purchase.product.seller.id,
            });
            await this.purchaseRepository.save(purchase);
          } catch {
            logger.error('Failed paying out purchase', {
              purchaseId: purchase.id,
              paymentIntentId: purchase.paymentIntentId,
              sellerId: purchase.product.seller.id,
            });
          }
        }),
      );
    } catch (e) {
      logger.error('Failed automatic payout', {
        error: e,
      });
    }

    logger.info('Automatic payout completed');
  }
  async reportPurchaseResolved(purchase: Purchase) {
    purchase.pausedAt = null;
    return this.purchaseRepository.save(purchase);
  }

  //---------------------------------------------------------------

  //--------------- WEBHOOK functions ----------------------
  async paymentStarted(
    payload: Stripe.Capability | Stripe.Charge | Stripe.PaymentIntent,
    logger: Logger,
  ) {
    const purchase = await this.purchaseRepository.findOne({
      where: { paymentIntentId: payload.id },
    });

    if (!purchase) {
      logger.error('PaymentStarted: No purchase found', {
        paymentIntentId: payload.id,
      });

      throw new Error(
        'PaymentStarted: No purchase found with id: ' + payload.id,
      );
    }

    purchase.paymentStartedAt = new Date();
    await this.purchaseRepository.save(purchase);

    logger.info('Payment started', {
      paymentIntentId: payload.id,
      purchaseId: purchase.id,
    });
  }
  async paymentCompleted(payload: Stripe.PaymentIntent, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { paymentIntentId: payload.id },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });

    if (!purchase) {
      logger.error('PaymentCompleted: No purchase found', {
        paymentIntentId: payload.id,
      });

      throw new Error(
        'PaymentCompleted: No purchase found with paymentIntentId: ' +
          payload.id,
      );
    }

    const chargeId = idFromObject(payload.latest_charge);
    const paymentAcceptedAt = new Date();
    const updateResult = await this.purchaseRepository.update(
      { paymentIntentId: payload.id, paymentAcceptedAt: IsNull() },
      {
        paymentAcceptedAt,
        ...(chargeId ? { chargeId } : {}),
      },
    );

    if (updateResult.affected > 0) {
      purchase.paymentAcceptedAt = paymentAcceptedAt;
      //System messages
      if (purchase.transportationMethod === TransportationEnum.SHIPPING) {
        this.systemMessagesService
          .purchaseWithShippingBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          )
          .then(() =>
            this.systemMessagesService.purchaseWithShippingSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          purchase.shippingPrice?.provider,
            ),
          )
          .catch((err) =>
            logger.error('purchaseWithShipping system messages failed', err),
        );
      } else {
        this.systemMessagesService
          .purchaseWithHandoffBuyer(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
          )
          .then(() =>
            this.systemMessagesService.purchaseWithHandoffSeller(
          purchase.buyer,
          purchase.product.seller,
          purchase.product,
          purchase,
            ),
          )
          .catch((err) =>
            logger.error('purchaseWithShipping system messages failed', err),
        );
      }
    }

    if (purchase.transportationMethod === TransportationEnum.SHIPPING) {
      logger.info({
        message:
          'Accepting payment of purchase with tranportation method SHIPPING',
        purchaseId: purchase.id,
        buyerId: purchase.buyerId,
      });
      await this.shippingService.bookShipping(purchase.id, logger);
    }

    logger.info('Payment completed', {
      paymentIntentId: payload.id,
      purchaseId: purchase.id,
    });
  }
  async paymentFailed(payload: Stripe.PaymentIntent, logger: Logger) {
    logger.info('Payment failed', {
      paymentIntentId: payload.id,
    });
    const purchase = await this.purchaseRepository.findOne({
      where: { paymentIntentId: payload.id },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });

    if (!purchase) {
      logger.error('PaymentFailed: No purchase found', {
        paymentIntentId: payload.id,
      });
      throw new Error(
        'PaymentFailed: No purchase found with paymentIntentId: ' + payload.id,
      );
    }
    const product = this.returnPurchaseQuantity(purchase.product, purchase);
    await this.productRepository.save(product);
    await this.purchaseRepository.remove(purchase);
  }
  async paymentCanceled(payload: Stripe.PaymentIntent, logger: Logger) {
    logger.info('Payment canceled', {
      paymentIntentId: payload.id,
    });
    const purchase = await this.purchaseRepository.findOne({
      where: { paymentIntentId: payload.id },
      relations: {
        buyer: true,
        product: { seller: true },
        shippingPrice: true,
      },
    });
    if (!purchase) {
      logger.error('PaymentFailed: No purchase found', {
        paymentIntentId: payload.id,
      });
      throw new Error(
        'PaymentFailed: No purchase found with paymentIntentId: ' + payload.id,
      );
    }
    if (purchase.failedAt) {
      logger.info('Purchase already canceled or otherwise failed', {
        paymentIntentId: payload.id,
      });
      return;
    }
    const product = this.returnPurchaseQuantity(purchase.product, purchase);
    purchase.failedAt = new Date();
    await this.productRepository.save(product);
    await this.purchaseRepository.remove(purchase);
  }

  async paymentRefunded(
    payload: Stripe.Refund | Stripe.Payout,
    logger: Logger,
  ) {
    if (!('payment_intent' in payload)) {
      logger.error("Can't handle refunds of payouts", {
        refundId: payload.id,
      });
      return;
    }

    //If refund is made directly through the payment of the customer, the payload will have a paymentIntentId
    //If refund is through the seller's connected account, the payload will have a charge with id matching the payment
    const paymentIntentId =
      typeof payload.payment_intent === 'string'
        ? payload.payment_intent
        : payload.payment_intent?.id;
    const chargeId =
      typeof payload.charge === 'string' ? payload.charge : payload.charge.id;
    const purchase = await this.purchaseRepository.findOne({
      where: paymentIntentId
        ? { paymentIntentId }
        : { destinationPaymentId: chargeId },
      relations: { reportPurchase: true, product: true },
    });
    if (!purchase) {
      logger.error('Purchase not found');
      return;
    }
    logger.info('Payment refund event', {
      purchaseId: purchase.id,
      refundId: payload.id,
      paymentIntentId,
      charge: payload.charge,
      status: payload.status,
    });

    if (payload.status !== 'succeeded') {
      logger.info('Refund not succeeded', {
        status: payload.status,
      });
      return;
    }

    if (purchase.failedAt) {
      logger.info('paymentRefunded: Purchase already refunded', {
        purchaseId: purchase.id,
        refundId: payload.id,
      });
      return;
    }

    const updateResult = await this.purchaseRepository.update(
      { id: purchase.id, failedAt: IsNull() },
      { failedAt: new Date(), refundId: payload.id },
    );
    if (updateResult.affected === 0) {
      logger.info('paymentRefunded: Lost race, purchase already handled', {
        purchaseId: purchase.id,
        refundId: payload.id,
      });
      return;
    }

    if (payload.metadata?.refundedBy) {
      const refundUser = await this.userRepository.findOneBy({
        id: payload.metadata.refundedBy,
      });
      if (refundUser) {
        await this.purchaseRepository.update(
          { id: purchase.id },
          { abortedById: refundUser.id },
        );
      }
    }
    const product = this.returnPurchaseQuantity(purchase.product, purchase);
    await this.productRepository.save(product);

    //This purchase has an active report. Resolve it and unpause the purchase
    if (purchase.reportPurchase && !purchase.reportPurchase.resolution) {
      logger.info('Resolving report as refunded', {
        reportId: purchase.reportPurchase.id,
        purchaseId: purchase.id,
      });
      try {
        await this.reportPurchaseService.resolveReport(
          ReportPurchaseResolutionEnum.REFUND,
          purchase.reportPurchase.id,
          logger,
        );
      } catch {
        /* empty */
      }
    }

    logger.info('Payment refunded', {
      paymentIntentId,
      purchaseId: purchase.id,
      productId: purchase.productId,
    });
  }
  async payoutStarted(payload: Stripe.Payout, logger: Logger) {
    await this.purchaseRepository.update(
      { payoutId: payload.id },
      { payoutStartedAt: new Date() },
    );

    logger.info('Payout started (webhook)', {
      payoutId: payload.id,
    });
  }
  async payoutComplete(payload: Stripe.Payout, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { payoutId: payload.id },
    });
    purchase.payoutReceivedAt = new Date();
    await this.purchaseRepository.save(purchase);

    logger.info('Payout completed (from webhook)', {
      payoutId: payload.id,
      purchaseId: purchase.id,
      buyerId: purchase.buyerId,
    });
  }
  async payoutFailed(payload: Stripe.Payout, logger: Logger) {
    await this.purchaseRepository.update(
      { payoutId: payload.id },
      { payoutFailedAt: new Date() },
    );

    logger.info('Payout failed (webhook)', {
      payoutId: payload.id,
    });
  }

  //------------------------------------------------------------

  //---------------------- CMS FUNCTIONS -----------------------
  async cmsListPurchases(
    input: CmsListPurchasesInput,
  ): Promise<CmsListPurchasesResponse> {
    const { pageSize = 10, page = 0, searchString = '', status } = input;
    const skip = Math.max(0, pageSize * page);

    const [purchases, total] = await this.purchaseRepository.findAndCount({
      where: [
        {
          status,
          product: {
            title: ILike(`%${searchString}%`),
          },
        },
        {
          status,
          product: {
            seller: {
              username: ILike(`%${searchString}%`),
            },
          },
        },
        {
          status,
          product: {
            seller: {
              email: ILike(`%${searchString}%`),
            },
          },
        },
        {
          status,
          buyer: {
            username: ILike(`%${searchString}%`),
          },
        },
        {
          status,
          buyer: {
            email: ILike(`%${searchString}%`),
          },
        },
        {
          status,
          shippingId: ILike(`%${searchString}%`),
        },
      ],
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
      relations: {
        product: {
          seller: true,
        },
        buyer: true,
      },
    });

    return { purchases, total };
  }

  async cmsRefundPurchase(
    purchaseId: string,
    logger: Logger,
  ): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: { reportPurchase: true },
    });

    if (!purchase) {
      throw BadUserInputException('Purchase not found');
    }

    logger.info('Admin refunding purchase', {
      purchaseId: purchase.id,
      paymentIntentId: purchase.paymentIntentId,
      status: purchase.status,
    });

    if (!purchase.paymentIntentId) {
      throw BadUserInputException('Cannot refund a free purchase');
    }

    if (purchase.refundId) {
      throw BadUserInputException('Purchase is already refunded');
    }

    const refund = await this.stripeService.refundPayment(
      purchase.paymentIntentId,
    );
    purchase.refundId = refund.id;
    purchase.failedAt = new Date();

    logger.info('Admin refund successful', {
      purchaseId: purchase.id,
      refundId: refund.id,
    });

    return this.purchaseRepository.save(purchase);
  }

  //------------------------------------------------------------
}
