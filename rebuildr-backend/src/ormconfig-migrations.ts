/**
 * Configures a DataSource for TypeORM CLI usage
 *
 * This module MUST NOT be imported by the Nest.JS application, since it configures a mini Nest.JS app without logging. These options interfere with other Nest.JS application configuration.
 *
 * The only purpose of this module is to run TypeORM migrations from a command-line, like so:
 *
 * ```shell
 * npm run typeorm migration:run -- -d src/datasource.ts
 * ```
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { dbConfig } from './ormconfig';
import { DataSource } from 'typeorm';
import { validateConfig } from './config';

// Initialize a mini-NestJS application so we can use configuration here. It might be cleaner to just use dotenv directly. I'm not exactly a fan of this.
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local.1p'],
      validate: validateConfig,
    }),
  ],
})
class DataSourceAppModule {}

export const dataSource = (async () => {
  const app = await NestFactory.create(DataSourceAppModule, { logger: false });
  const configService = app.get(ConfigService);

  const isCompiled = __filename.includes('/dist/');
  const migrations = isCompiled ? './dist/migration/*.js' : './migration/*{.ts,.js}';

  return new DataSource({
    ...dbConfig(configService),
    migrations: [migrations],
  });
})();
