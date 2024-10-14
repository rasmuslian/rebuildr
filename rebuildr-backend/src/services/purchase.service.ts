import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RockerService } from './rocker.service';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentStarted,
} from 'src/apis/types/rocker-types';

enum PurchaseStatusEnum {
  INIT, //Buyer has started process to buy product
  PAYMENT_PENDING, //Buyer is comitting money to purchase product
  DELIVERING, //Product should be delivered
  APPROVEMENT_PENDING, //Product has been delivered, waiting on approve from Buyer
  PAYOUT_PENDING, //Seller is in process to receive payout
  FINISHED_FAILED, //purchase was for any reason canceled
  FINISHED_SUCCESS, //purchase was successfully completed
}

export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rockerService: RockerService,
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

  getPurchaseStatus(purchase: Purchase) {
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

    purchase.paymentReceivedByRockerAt = new Date(payload.timestamp);
    await this.purchaseRepository.save(purchase);
  }
  async paymentFailed(payload: IPaymentFailed) {
    await this.purchaseRepository.update(
      { rockerPaymentId: payload.paymentId },
      { failureAt: new Date(payload.timestamp) },
    );
  }
}
