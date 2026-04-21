import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { Product } from './products/entities/product.entity';
import { Catalog } from './catalogs/entities/catalog.entity';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? 'shop.sqlite',
      entities: [Product, Catalog],
      // synchronize is safe for development/test; production requires migrations
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ProductsModule,
    CatalogsModule,
  ],
})
export class AppModule {}
