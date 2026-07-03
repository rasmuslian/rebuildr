// Import this first!
import './instrument';

import { BaseExceptionFilter, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';

import { ArgumentsHost, Catch, Inject } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter';
import { AuthenticationError } from '@nestjs/apollo';
import { Logger } from 'winston';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { GqlContextType } from '@nestjs/graphql';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      new ExternalExceptionFilter().catch(exception, host);
    } else {
      super.catch(exception, host);
    }
  }
}

@Catch(GraphQLError)
export class AuthenticationErrorFilter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R = any,
> extends ExternalExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }

  /**
   * Disable logging for some expected errors like AuthenticationError
   */
  catch(exception: T): R | Promise<R> {
    if (
      exception instanceof Error &&
      !(exception instanceof AuthenticationError)
    ) {
      this.logger.error(exception);
    }

    throw exception;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Stripe webhook needs raw body
  app.use('/stripe-webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(
    '/aterbyggaren/chat/stream',
    bodyParser.json({ limit: '8mb', type: 'application/json' }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  //https://docs.nestjs.com/security/helmet
  app.use(
    helmet({
      //this configuration is necessary to allow apollo sandbox
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
  const allowedOrigins = [
    process.env.WEB_BASE_URL,
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : []),
  ].filter(Boolean);
  app.enableCors({ origin: allowedOrigins, credentials: true });
  await app.listen(3000);
}
bootstrap();
