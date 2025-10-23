import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { Catch, Inject } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter';
import { AuthenticationError } from '@nestjs/apollo';
import { Logger } from 'winston';
import * as bodyParser from 'body-parser';

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
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Stripe webhook needs raw body
  app.use('/stripe-webhook', bodyParser.raw({ type: 'application/json' }));

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
