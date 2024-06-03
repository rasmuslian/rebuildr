import { DataSource } from 'typeorm';
import { dbConfig } from './ormconfig';

const migrations = './migration/*{.ts,.js}';

const config = {
  ...dbConfig(),
  migrations: [migrations],
};

export const dataSource = new DataSource(config);
