import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { Product } from './products/entities/product.entity';
import { Catalog } from './catalogs/entities/catalog.entity';
import { AppController } from './app.controller';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? 'shop.sqlite',
      entities: [Product, Catalog],
      // Dev/test: auto-sync keeps the schema in step with entities.
      // Production: synchronize is off; migrations run on startup instead.
      synchronize: !isProd,
      migrations: isProd ? [__dirname + '/database/migrations/*.js'] : [],
      migrationsRun: isProd,
    }),
    ProductsModule,
    CatalogsModule,
  ],
})
export class AppModule {}
