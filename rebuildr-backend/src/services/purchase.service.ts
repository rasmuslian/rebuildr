import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { RockerService } from './rocker.service';
import {
  BadUserInputException,
  ForbiddenException,
  InternalServerException,
} from 'src/exceptions';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentStarted,
  IPayoutCompleted,
  IPayoutFailed,
  IPayoutStarted,
} from 'src/apis/types/rocker-types';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

enum PurchaseStatusEnum {
  INIT, //Buyer has started process to buy product
  PAYMENT_PENDING, //Buyer is comitting money to purchase product
  DELIVERING, //Product should be delivered
  APPROVEMENT_PENDING, //Product has been delivered, waiting on approve from Buyer
  PAYOUT_PENDING, //Seller is in process to receive payout
  FINISHED_FAILED, //purchase was for any reason canceled
  FINISHED_SUCCESS, //purchase was successfully completed
  FAILED, //Purchase has failed somewhere in its lifecycle and needs action to proceed
}

export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rockerService: RockerService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}
  async purchase(productId: string, userId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { user: true, purchases: true },
    });
    const buyer = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!product?.user?.rockerUserId || !buyer?.rockerUserId) {
      throw BadUserInputException();
    }

    //Product is only available if its only purchases are failed ones
    const available = product.purchases.every(
      (purchase) =>
        this.getPurchaseStatus(purchase) === PurchaseStatusEnum.FINISHED_FAILED,
    );
    if (!available) {
      throw InternalServerException('Product not available for purchase');
    }

    const purchase = new Purchase();
    if (!product.isGiveaway) {
      const offer = await this.rockerService.createOffer(product.id);

      const payment = await this.rockerService.createPayment(
        offer.id,
        buyer.rockerUserId,
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

  //Product of purchase is accepted. Payment is confirmed and payout is started
  private async acceptPurchase(purchase: Purchase) {
    const status = this.getPurchaseStatus(purchase);
    if (status !== PurchaseStatusEnum.APPROVEMENT_PENDING) {
      this.logger.error('Accepting purchase wrong status: ', status);
      throw BadUserInputException();
    }

    await this.rockerService.confirmPayment(purchase.rockerPaymentId);
    purchase.approvedAt = new Date();

    try {
      const payoutResponse = await this.rockerService.createPayout(
        purchase.rockerPaymentId,
      );
      purchase.rockerPayoutId = payoutResponse.id;
    } catch {
      this.logger.error('Error when creating payout');
      purchase.failedAt = new Date();
    }

    return await this.purchaseRepository.save(purchase);
  }
  async manualAcceptPurchase(purchaseId: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const purchase = await this.purchaseRepository.findOne({
      where: {
        id: purchaseId,
      },
    });

    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', purchase)) {
      throw ForbiddenException();
    }
    return await this.acceptPurchase(purchase);
  }
  //Every hour, accept purchases that are waiting approval from
  //the buyer
  @Cron(CronExpression.EVERY_HOUR)
  async autoAcceptPurchases() {
    this.logger.log('Auto accepting purchases');
    const dueTime = dayjs().add(1, 'day');
    const duePurchases = await this.purchaseRepository.find({
      where: {
        deliveredAt: MoreThanOrEqual(dueTime.toDate()),
        approvedAt: IsNull(),
        disapprovedAt: IsNull(),
        failedAt: IsNull(),
      },
    });
    await Promise.all(
      duePurchases.map((p) => {
        return this.acceptPurchase(p);
      }),
    );
  }

  getPurchaseStatus(purchase: Purchase) {
    if (purchase.failedAt) {
      return PurchaseStatusEnum.FAILED;
    }
    if (purchase.payoutReceivedAt) {
      return PurchaseStatusEnum.FINISHED_SUCCESS;
    }
    if (purchase.disapprovedAt) {
      return PurchaseStatusEnum.FINISHED_FAILED;
    }
    if (purchase.approvedAt) {
      return PurchaseStatusEnum.PAYOUT_PENDING;
    }
    if (purchase.deliveredAt) {
      return PurchaseStatusEnum.APPROVEMENT_PENDING;
    }
    if (purchase.paymentAcceptedByRockerAt) {
      return PurchaseStatusEnum.DELIVERING;
    }
    if (purchase.paymentSentToRockerAt) {
      return PurchaseStatusEnum.PAYMENT_PENDING;
    }
    return PurchaseStatusEnum.INIT;
  }

  async paymentStarted(payload: IPaymentStarted) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
    });

    if (!purchase) {
      throw new Error(
        'PaymentStarted: No purchase found with id: ' + payload.paymentId,
      );
    }

    purchase.paymentSentToRockerAt = new Date(payload.timestamp);
    await this.purchaseRepository.save(purchase);
  }
  async paymentCompleted(payload: IPaymentCompleted) {
    const purchase = await this.purchaseRepository.findOne({
      where: { rockerPaymentId: payload.paymentId },
    });

    if (!purchase) {
      throw new Error(
        'PaymentCompleted: No purchase found with id: ' + payload.paymentId,
      );
    }

    purchase.paymentAcceptedByRockerAt = new Date(payload.timestamp);
    await this.purchaseRepository.save(purchase);
  }
  async paymentFailed(payload: IPaymentFailed) {
    await this.purchaseRepository.update(
      { rockerPaymentId: payload.paymentId },
      { failedAt: new Date(payload.timestamp) },
    );
  }

  async payoutStarted(payload: IPayoutStarted) {
    await this.purchaseRepository.update(
      { rockerPayoutId: payload.payoutId },
      { payoutStartedAt: new Date(payload.timestamp) },
    );
  }

  async payoutComplete(payload: IPayoutCompleted) {
    await this.purchaseRepository.update(
      { rockerPayoutId: payload.payoutId },
      { payoutReceivedAt: new Date(payload.timestamp) },
    );
  }

  async payoutFailed(payload: IPayoutFailed) {
    await this.purchaseRepository.update(
      { rockerPayoutId: payload.payoutId },
      { failedAt: new Date(payload.timestamp) },
    );
  }
}
