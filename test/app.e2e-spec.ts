import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { ProductsModule } from '../src/products/products.module';
import { CatalogsModule } from '../src/catalogs/catalogs.module';
import { Product } from '../src/products/entities/product.entity';
import { Catalog } from '../src/catalogs/entities/catalog.entity';

// Isolated test module: uses SQLite in-memory so runs never touch shop.sqlite
async function buildApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Product, Catalog],
        synchronize: true,
      }),
      ProductsModule,
      CatalogsModule,
    ],
    controllers: [AppController],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

describe('e2e', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('returns health check payload', async () => {
      const res = await request(app.getHttpServer()).get('/').expect(200);
      const body = res.body as { status: string; timestamp: string };
      expect(body.status).toBe('ok');
      expect(typeof body.timestamp).toBe('string');
    });
  });

  describe('GET /products', () => {
    it('returns empty paginated list on fresh DB', async () => {
      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);
      const body = res.body as { data: unknown[]; total: number };
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.total).toBe(0);
    });
  });

  describe('GET /catalogs', () => {
    it('returns empty paginated list on fresh DB', async () => {
      const res = await request(app.getHttpServer())
        .get('/catalogs')
        .expect(200);
      const body = res.body as { data: unknown[]; total: number };
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.total).toBe(0);
    });
  });

  describe('POST /products', () => {
    it('creates a product and returns 201 with correct shape', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test Product', price: 49.99 })
        .expect(201);

      const body = res.body as { id: string; name: string; price: number };
      expect(body.name).toBe('Test Product');
      expect(body.price).toBe(49.99);
      expect(typeof body.id).toBe('string');
    });

    it('returns 400 when price is missing', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'No price' })
        .expect(400);
    });

    it('returns 400 when unknown fields are sent', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test', price: 10, hacked: true })
        .expect(400);
    });
  });

  describe('GET /products/:id', () => {
    it('returns 404 for non-existent uuid', async () => {
      await request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('returns 400 for malformed uuid', async () => {
      await request(app.getHttpServer())
        .get('/products/not-a-uuid')
        .expect(400);
    });
  });

  describe('catalog–product assignment flow', () => {
    it('assigns a product to a catalog and retrieves it', async () => {
      // create product
      const productRes = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Widget', price: 19.99 })
        .expect(201);
      const { id: productId } = productRes.body as { id: string };

      // create catalog
      const catalogRes = await request(app.getHttpServer())
        .post('/catalogs')
        .send({ name: 'Featured' })
        .expect(201);
      const { id: catalogId } = catalogRes.body as { id: string };

      // assign
      await request(app.getHttpServer())
        .post(`/catalogs/${catalogId}/products/${productId}`)
        .expect(201);

      // verify
      const listRes = await request(app.getHttpServer())
        .get(`/catalogs/${catalogId}/products`)
        .expect(200);
      const list = listRes.body as { data: { id: string }[]; total: number };
      expect(list.total).toBe(1);
      expect(list.data[0].id).toBe(productId);

      // remove
      await request(app.getHttpServer())
        .delete(`/catalogs/${catalogId}/products/${productId}`)
        .expect(200);

      // verify empty
      const emptyRes = await request(app.getHttpServer())
        .get(`/catalogs/${catalogId}/products`)
        .expect(200);
      const empty = emptyRes.body as { total: number };
      expect(empty.total).toBe(0);
    });
  });
});
