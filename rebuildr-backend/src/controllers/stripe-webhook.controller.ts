import {
  Controller,
  HttpCode,
  Post,
  Headers,
  BadRequestException,
  Req,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PurchaseService } from 'src/services/purchase.service';
import { StripeService } from 'src/services/stripe.service';
import Stripe from 'stripe';
import { Logger } from 'winston';

@Controller('stripe-webhook')
export class StripWebhookController {
  private stripe: Stripe;
  constructor(
    private configService: ConfigService,
    private stripeService: StripeService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private purchaseService: PurchaseService,
  ) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }
  //This endoint will receive events regarding RebuildR's account
  @Post('/platform-account')
  @HttpCode(200)
  async platformAccountSnapshot(
    @Headers('stripe-signature') stripeSignature: string,
    @Req() req: Request,
  ) {
    const requestId = crypto.randomUUID();

    const logger = this.logger.child({
      requestId,
    });
    logger.info({
      message: 'Stripe webhook request - platform account snapshot',
    });

    const secret = this.configService.get(
      'STRIPE_WEBHOOK_SECRET_SNAPSHOT_PLATFORM_ACCOUNT',
    );
    if (!secret) {
      logger.error('Stripe webhook secret is not set');
      throw new Error('Stripe webhook secret is not set');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        stripeSignature,
        secret,
      );
    } catch (err) {
      logger.error('Webhook signature verification failed.', err);
      throw new BadRequestException('Webhook signature verification failed');
    }

    logger.info('Event', {
      id: event.id,
      type: event.type,
      data: event.data,
    });

    switch (event.type) {
      case 'account.updated':
        await this.stripeService.onAccountUpdated(event.data.object);
        break;
      case 'capability.updated':
        logger.info('Capability updated (handling not implemented)', {
          account: event.data.object.account,
        });
        break;
      case 'charge.failed':
      case 'charge.pending':
      case 'charge.refunded':
        logger.info('Charge events (handling not implemented)', {
          chargeId: event.data.object.id,
        });
        break;
      case 'charge.succeeded':
        await this.stripeService.linkChargeToPurchase(
          event.data.object,
          logger,
        );
        return;
      case 'payment_intent.created':
        await this.purchaseService.paymentStarted(event.data.object, logger);
        break;
      case 'payment_intent.canceled':
        console.log('när händer detta?');
        break;
      case 'payment_intent.payment_failed':
        await this.purchaseService.paymentFailed(event.data.object, logger);
        break;
      case 'payment_intent.succeeded':
        await this.purchaseService.paymentCompleted(event.data.object, logger);
        break;
      case 'refund.created':
      case 'refund.updated':
        await this.purchaseService.paymentRefunded(event.data.object, logger);
        break;
      case 'refund.failed':
        logger.info('Refund failed', {
          refundId: event.data.object.id,
        });
        break;
      case 'transfer.updated':
      case 'transfer.created':
        await this.stripeService.linkTransferToPurchase(
          event.data.object,
          logger,
        );
        break;
      default:
        logger.info('Event type not supported', {
          type: event.type,
        });
    }
    return;
  }
  //This endpoint will receive events regarding connected accounts
  @Post('/connected-account')
  @HttpCode(200)
  async connectedAccountSnapshot(
    @Headers('stripe-signature') stripeSignature: string,
    @Req() req: Request,
  ) {
    const requestId = crypto.randomUUID();

    const logger = this.logger.child({
      requestId,
    });
    logger.info({
      message: 'Stripe webhook request - connected account snapshot',
    });

    const secret = this.configService.get(
      'STRIPE_WEBHOOK_SECRET_SNAPSHOT_CONNECTED_ACCOUNT',
    );
    if (!secret) {
      logger.error('Stripe webhook secret is not set');
      throw new Error('Stripe webhook secret is not set');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        stripeSignature,
        secret,
      );
    } catch (err) {
      logger.error('Webhook signature verification failed.', err);
      throw new BadRequestException('Webhook signature verification failed');
    }

    logger.info('Event', {
      id: event.id,
      type: event.type,
      data: event.data,
    });

    switch (event.type) {
      case 'account.updated':
        await this.stripeService.onAccountUpdated(event.data.object);
        break;
      case 'capability.updated':
        logger.info('Capability updated (handling not implemented)', {
          account: event.data.object.account,
        });
        break;
      case 'payout.created':
        await this.purchaseService.payoutStarted(event.data.object, logger);
        break;
      case 'payout.failed':
        await this.purchaseService.payoutFailed(event.data.object, logger);
        break;
      case 'payout.paid':
        await this.purchaseService.payoutComplete(event.data.object, logger);
        break;
      case 'payout.updated':
        logger.info('Payout update', {
          payoutId: event.data.object.id,
        });
        break;
      case 'refund.created':
      case 'refund.updated':
        await this.purchaseService.paymentRefunded(event.data.object, logger);
        break;
      case 'refund.failed':
        logger.info('Refund failed', {
          refundId: event.data.object.id,
        });
        break;
      default:
        logger.info('Event type not supported', {
          type: event.type,
        });
    }
    return;
  }
}
