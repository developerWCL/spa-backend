import { registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import type { DotenvConfigOptions } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config({ path: '.env' } as DotenvConfigOptions);

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'postgres',
  // Use src globs when running under ts-node (config file is .ts),
  // otherwise use dist globs to avoid loading the same migration twice.
  entities: __filename.endsWith('.ts')
    ? ['src/**/*.entity{.ts,.js}']
    : ['dist/**/*.entity{.js,.ts}'],
  migrations: __filename.endsWith('.ts')
    ? ['src/migrations/*{.ts,.js}']
    : ['dist/migrations/*{.js,.ts}'],
  // synchronize should be false in production
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true' ? true : false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export default registerAs(
  'typeorm',
  () => typeOrmConfig as unknown as Record<string, any>,
);

export const dataSource = new DataSource(
  typeOrmConfig as unknown as DataSourceOptions,
);
