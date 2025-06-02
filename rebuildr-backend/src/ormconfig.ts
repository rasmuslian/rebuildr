import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { EnvironmentVariables } from './config';

export const dbConfig = (
  configService: ConfigService<EnvironmentVariables>,
) => {
  const isProd = configService.get('NODE_ENV') === 'production';

  let typeormConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT')),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    synchronize: false,
    logging: false,
    ssl: isProd
      ? { ca: configService.get('CA_CERT'), rejectUnauthorized: false }
      : false,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: ['migration/*.js'],
  };

  if (isProd) {
    typeormConfig = {
      ...typeormConfig,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }

  return typeormConfig;
};
