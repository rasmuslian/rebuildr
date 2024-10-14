import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentStarted,
} from 'src/apis/types/rocker-types';
import * as crypto from 'crypto';

type RockerWebhookPayload =
  | IPaymentStarted
  | IPaymentFailed
  | IPaymentCompleted;

@Controller('rockerWebhook')
export class RockerWebhookController {
  @Post()
  @HttpCode(200)
  async webhookData(
    @Req() _request: Request,
    @Body() body: RockerWebhookPayload,
  ) {
    const request = await _request.json();
    const rockerSignature = request.headers['X-Rocker-Pay-Signature'];
    const timestamp = request.headers['X-Rocker-Pay-Timestamp'];
    const hmac = crypto.createHmac('sha256', 'secret');
    hmac.update(`${timestamp}.${body}`);
    const serverSignature = hmac.digest('hex');

    const verified = serverSignature === rockerSignature;
    if (!verified) {
      return;
    }

    return;
  }
}
