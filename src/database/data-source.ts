import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Catalog } from '../catalogs/entities/catalog.entity';

// Used by the TypeORM CLI: migration:generate, migration:run, migration:revert
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH ?? 'shop.sqlite',
  entities: [Product, Catalog],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  migrationsRun: false,
});
