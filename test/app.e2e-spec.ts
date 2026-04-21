import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('returns health check payload', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(typeof res.body.timestamp).toBe('string');
        });
    });
  });

  describe('GET /products', () => {
    it('returns paginated product list', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(typeof res.body.total).toBe('number');
        });
    });
  });

  describe('GET /catalogs', () => {
    it('returns paginated catalog list', () => {
      return request(app.getHttpServer())
        .get('/catalogs')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(typeof res.body.total).toBe('number');
        });
    });
  });

  describe('POST /products', () => {
    it('creates a product and returns 201', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test Product', price: 49.99 })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Test Product');
          expect(res.body.price).toBe(49.99);
          expect(typeof res.body.id).toBe('string');
        });
    });

    it('returns 400 on missing required fields', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'No price' })
        .expect(400);
    });
  });

  describe('GET /products/:id', () => {
    it('returns 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
