import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Post,
} from '@nestjs/common';
import {
  IPaymentCompleted,
  IPaymentFailed,
  IPaymentPauseStateChanged,
  IPaymentRefunded,
  IPaymentStarted,
  IPayoutCompleted,
  IPayoutFailed,
  IPayoutStarted,
  PauseStateEnum,
} from 'src/apis/types/rocker-types';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PurchaseService } from 'src/services/purchase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
type RockerWebhookPayload =
  | IPaymentStarted
  | IPaymentFailed
  | IPaymentCompleted
  | IPaymentPauseStateChanged
  | IPaymentRefunded
  | IPayoutStarted
  | IPayoutCompleted
  | IPayoutFailed;

@Controller('rocker-webhook')
export class RockerWebhookController {
  constructor(
    private purchaseService: PurchaseService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  // @Post()
  // @HttpCode(200)
  // async webhookData(
  //   @Headers('X-Rocker-Pay-Signature') rockerSignature: string,
  //   @Headers('X-Rocker-Pay-Timestamp') timestamp: string,
  //   @Body() body: RockerWebhookPayload,
  // ) {
  //   const requestId = crypto.randomUUID();

  //   const logger = this.logger.child({
  //     requestId,
  //     paymentId: body.paymentId,
  //   });

  //   if (!rockerSignature || !timestamp) {
  //     logger.error('Rocker webhook request is missing headers');
  //     throw new Error('Rocker webhook request is missing headers');
  //   }

  //   const secret = this.configService.get('ROCKER_WEBHOOK_SECRET');

  //   if (!secret) {
  //     logger.error('Rocker webhook secret is not set');
  //     throw new Error('Rocker webhook secret is not set');
  //   }

  //   logger.info({
  //     message: 'Rocker webhook request',
  //     timestamp,
  //     body,
  //   });

  //   const hmac = crypto.createHmac('sha256', secret);
  //   hmac.update(`${timestamp}.${JSON.stringify(body)}`);
  //   const serverSignature = hmac.digest('hex');

  //   const verified = serverSignature === rockerSignature;
  //   if (!verified) {
  //     logger.error('Rocker webhook signature verification failed');
  //     throw new Error('Rocker webhook signature verification failed');
  //   }

  //   try {
  //     if (body.$type === 'PaymentStarted') {
  //       logger.info('Payment started');
  //       await this.purchaseService.paymentStarted(body, logger);
  //       return;
  //     }

  //     if (body.$type === 'PaymentCompleted') {
  //       logger.info('Payment completed');
  //       await this.purchaseService.paymentCompleted(body, logger);
  //       return;
  //     }

  //     if (body.$type === 'PaymentPauseStateChanged') {
  //       logger.info('Payment pause state changed', {
  //         newState: body.newState,
  //       });

  //       if (
  //         body.newState === PauseStateEnum.PAUSED &&
  //         body.oldState !== PauseStateEnum.PAUSED
  //       ) {
  //         await this.purchaseService.pausePaymentByRocker(
  //           body.paymentId,
  //           logger,
  //         );
  //       }

  //       if (
  //         body.newState === PauseStateEnum.NOT_PAUSED &&
  //         body.oldState !== PauseStateEnum.NOT_PAUSED
  //       ) {
  //         await this.purchaseService.resumePaymentByRocker(
  //           body.paymentId,
  //           logger,
  //         );
  //       }
  //       return;
  //     }

  //     if (body.$type === 'PaymentFailed') {
  //       logger.warn('Payment failed', {
  //         errorCode: body.errorCode,
  //         swishErrorCode: body.swishErrorCode,
  //       });

  //       await this.purchaseService.paymentFailed(body, logger);

  //       return;
  //     }
  //     if (body.$type === 'PaymentRefunded') {
  //       logger.info('Payment refunded');
  //       await this.purchaseService.paymentRefunded(body, logger);
  //       return;
  //     }
  //     if (body.$type === 'PayoutStarted') {
  //       logger.info('Payout started');
  //       await this.purchaseService.payoutStarted(body, logger);
  //       return;
  //     }
  //     if (body.$type === 'PayoutCompleted') {
  //       logger.info('Payout completed');
  //       await this.purchaseService.payoutComplete(body, logger);
  //       return;
  //     }
  //     if (body.$type === 'PayoutFailed') {
  //       logger.warn('Payout failed');
  //       await this.purchaseService.payoutFailed(body, logger);
  //       return;
  //     }

  //     logger.warn('Unhandled Rocker webhook body', {
  //       body,
  //     });
  //   } catch (e) {
  //     logger.error(e);
  //   }

  //   //Always return 200 to Rocker
  //   return;
  // }
}
