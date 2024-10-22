import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
} from '@nestjs/common';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentStarted,
  IPayoutAccountVerification,
  IPayoutCompleted,
  IPayoutFailed,
  IPayoutStarted,
} from 'src/apis/types/rocker-types';
import * as crypto from 'crypto';
import { PurchaseService } from 'src/services/purchase.service';
import { ConfigService } from '@nestjs/config';
import { RockerService } from 'src/services/rocker.service';

type RockerWebhookPayload =
  | IPaymentStarted
  | IPaymentFailed
  | IPaymentCompleted
  | IPayoutAccountVerification
  | IPayoutStarted
  | IPayoutCompleted
  | IPayoutFailed;

@Controller('rocker-webhook')
export class RockerWebhookController {
  private readonly logger = new Logger(RockerWebhookController.name);
  constructor(
    private purchaseService: PurchaseService,
    private configService: ConfigService,
    private rockerService: RockerService,
  ) {}
  @Post()
  @HttpCode(200)
  async webhookData(
    @Headers('X-Rocker-Pay-Signature') rockerSignature: string,
    @Headers('X-Rocker-Pay-Timestamp') timestamp: string,
    @Body() body: RockerWebhookPayload,
  ) {
    if (!rockerSignature || !timestamp) {
      this.logger.error('Webhook request is missing headers');
      return;
    }
    const secret = this.configService.get('ROCKER_WEBHOOK_SECRET');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${timestamp}.${body}`);
    const serverSignature = hmac.digest('hex');

    const verified = serverSignature === rockerSignature;
    if (!verified) {
      return;
    }

    try {
      if (body.$type === 'PaymentStarted') {
        await this.purchaseService.paymentStarted(body);
        return;
      }
      if (body.$type === 'PaymentCompleted') {
        await this.purchaseService.paymentCompleted(body);
        return;
      }
      if (body.$type === 'PaymentFailed') {
        await this.purchaseService.paymentFailed(body);
        this.logger.error('Payment failed: ');
        this.logger.error('Error code: ' + body.errorCode);
        this.logger.error('swishErrorCode: ', body.swishErrorCode);
        return;
      }
      if (body.$type === 'PayoutAccountVerification') {
        await this.rockerService.verifyPayoutAccount(body);
        return;
      }
      if (body.$type === 'PayoutStarted') {
        await this.purchaseService.payoutStarted(body);
        return;
      }
      if (body.$type === 'PayoutCompleted') {
        await this.purchaseService.payoutComplete(body);
        return;
      }
      if (body.$type === 'PayoutFailed') {
        await this.purchaseService.payoutFailed(body);
        return;
      }
    } catch (e) {
      this.logger.error(e);
    }

    //Always return 200 to Rocker
    return;
  }
}
