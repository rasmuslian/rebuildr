import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentStarted,
} from 'src/apis/types/rocker-types';
import * as crypto from 'crypto';
import { PurchaseService } from 'src/services/purchase.service';
import { ConfigService } from '@nestjs/config';

type RockerWebhookPayload =
  | IPaymentStarted
  | IPaymentFailed
  | IPaymentCompleted;

@Controller('rockerWebhook')
export class RockerWebhookController {
  constructor(
    private purchaseService: PurchaseService,
    private configService: ConfigService,
  ) {}
  @Post()
  @HttpCode(200)
  async webhookData(
    @Headers('X-Rocker-Pay-Signature') rockerSignature: string,
    @Headers('X-Rocker-Pay-Timestamp') timestamp: string,
    @Body() body: RockerWebhookPayload,
  ) {
    if (!rockerSignature || !timestamp) {
      console.log('Webhook request is missing headers');
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
        console.log('Payment failed: ');
        console.log('Error code: ' + body.errorCode);
        console.log('swishErrorCode: ', body.swishErrorCode);
        return;
      }
    } catch (e) {
      console.log(e);
    }

    //Always return 200 to Rocker
    return;
  }
}
