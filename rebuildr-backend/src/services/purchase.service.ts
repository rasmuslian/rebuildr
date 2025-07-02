import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { Purchase, PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { In, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { RockerService, SupportedPaymentMethod } from './rocker.service';
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
  Status1Enum,
} from 'src/apis/types/rocker-types';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { FileService } from './file.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LatestPurchaseInput } from 'src/resolvers/purchase.resolver';
import { Review } from 'src/entities/review.entity';

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
  ) {}
  async createPurchase(
    productId: string,
    userId: string,
    paymentMethod: SupportedPaymentMethod,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { seller: true, purchases: true },
    });
    const buyer = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!product?.seller?.rockerUserId || !buyer?.rockerUserId) {
      throw BadUserInputException();
    }

    //Product is only available if its only purchases are failed ones
    const available = product.purchases.every(
      (purchase) => purchase.status === PurchaseStatusEnum.FINISHED_FAILED,
    );
    if (!available) {
      throw InternalServerException('Product not available for purchase');
    }

    const purchase = new Purchase();
    if (!product.isGiveaway) {
      if (!product?.seller?.rockerUserId) {
        throw InternalServerException();
      }

      const price = product.price;
      //TODO: this is placeholder fee amount
      const escrow = price - 10;
      const fee = 10;

      const imageUrls = await Promise.all(
        product.images.map(async (image) => {
          return await this.fileService.getUrl(image);
        }),
      );

      const offer = await this.rockerService.createOffer(
        product.title,
        product.id,
        product.seller.rockerUserId,
        escrow,
        fee,
        imageUrls,
      );

      const payment = await this.rockerService.createPayment(
        offer.id,
        buyer.rockerUserId,
        paymentMethod,
      );

      purchase.rockerOfferId = offer.id;
      purchase.rockerPaymentId = payment.id;
    }

    purchase.buyer = buyer;
    purchase.product = product;
    const savedPurchase = await this.purchaseRepository.save(purchase);
    return {
      purchase: savedPurchase,
      product: product,
    };
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
    });

    if (!purchase) {
      logger.error('MarkAsDelivered: Purchase invalid', {
        purchaseId: purchaseId,
        buyerId: purchase.buyerId,
        currentUserId,
      });

      throw BadUserInputException('Purchase invalid');
    }

    purchase.deliveredAt = new Date();
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
    if (!purchase.approvedAt) purchase.approvedAt = new Date();

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
      cron: 'manualAcceptPurchase',
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
      logger,
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
        return this.acceptPurchase(p, p.buyer, p.product.seller, logger);
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

    purchase.paymentSentAt = new Date(payload.timestamp);
    await this.purchaseRepository.save(purchase);

    logger.info('Payment started', {
      paymentId: payload.paymentId,
      purchaseId: purchase.id,
    });
  }
  async paymentCompleted(payload: IPaymentCompleted, logger: Logger) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
      relations: { buyer: true, product: { seller: true } },
    });

    if (!purchase) {
      logger.error('PaymentCompleted: No purchase found', {
        paymentId: payload.paymentId,
      });

      throw new Error(
        'PaymentCompleted: No purchase found with id: ' + payload.paymentId,
      );
    }

    purchase.paymentAcceptedAt = new Date(payload.timestamp);
    await this.purchaseRepository.save(purchase);

    logger.info('Payment completed', {
      paymentId: payload.paymentId,
      purchaseId: purchase.id,
    });
  }
  async paymentFailed(payload: IPaymentFailed, logger: Logger) {
    await this.purchaseRepository.update(
      { rockerPaymentId: payload.paymentId },
      { failedAt: new Date(payload.timestamp) },
    );

    logger.info('Payment failed', {
      paymentId: payload.paymentId,
    });
  }
  async paymentRefunded(payload: IPaymentRefunded, logger: Logger) {
    await this.purchaseRepository.update(
      { rockerPaymentId: payload.paymentId },
      { failedAt: new Date(payload.timestamp), refundId: payload.refundId },
    );

    logger.info('Payment refunded', {
      paymentId: payload.paymentId,
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
      relations: { product: { seller: true } },
    });
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
