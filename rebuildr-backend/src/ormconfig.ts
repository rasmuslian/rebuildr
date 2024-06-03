import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const isProd = process.env.NODE_ENV === 'production';

export const dbConfig = () => {
  let typeormConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    ssl: isProd
      ? { ca: process.env.CA_CERT, rejectUnauthorized: false }
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

// Config for backend
export const config = dbConfig();

// Config for migrations
export const dataSource = new DataSource(dbConfig());
