# Shop Catalog API

A production-ready REST API for managing an electronics shop catalog and products, built with NestJS, TypeORM, and SQLite.

## Features

- Full CRUD for **Products** and **Catalogs**
- **Many-to-many** relationship between catalogs and products
- Pagination on all list endpoints
- Input validation with `class-validator`
- Interactive **Swagger UI** at `/api`
- Unit tests for all service methods
- Docker support

## Tech Stack

- **NestJS** (v11) — framework
- **TypeORM** — ORM
- **SQLite** — database (easily replaceable, see below)
- **class-validator / class-transformer** — DTO validation
- **@nestjs/swagger** — API documentation

## Project Structure

```
src/
├── app.module.ts              # Root module with TypeORM config
├── main.ts                    # Bootstrap with Swagger + ValidationPipe
├── database/
│   └── seed.ts                # Seed script (12 products, 4 catalogs)
├── common/
│   └── dto/
│       └── pagination.dto.ts
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── entities/product.entity.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.service.spec.ts
│   └── products.module.ts
└── catalogs/
    ├── dto/
    │   ├── create-catalog.dto.ts
    │   └── update-catalog.dto.ts
    ├── entities/catalog.entity.ts
    ├── catalogs.controller.ts
    ├── catalogs.service.ts
    ├── catalogs.service.spec.ts
    └── catalogs.module.ts
```

## Setup & Run Locally

### Prerequisites

- Node.js 20+
- npm

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run start:dev
```

### Seed the database

```bash
npm run seed
```

This inserts 12 electronics products and 4 catalogs (Smartphones, Laptops, Accessories, New Arrivals) with products assigned across multiple catalogs.

### Run in production mode

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.  
Swagger UI: `http://localhost:3000/api`

### Environment variables

| Variable | Default | Notes |
|----------|---------|-------|
| `NODE_ENV` | `development` | When `production`, disables `synchronize`, runs migrations on startup, requires `CORS_ORIGIN`, hides Swagger unless `ENABLE_SWAGGER=true`. |
| `PORT` | `3000` | HTTP port. |
| `DATABASE_PATH` | `shop.sqlite` | Path to the SQLite file. In Docker it is `/app/data/shop.sqlite`. |
| `CORS_ORIGIN` | — | **Required in production.** Allowed origin(s). In development CORS is open. |
| `ENABLE_SWAGGER` | `false` in prod | Set to `true` to expose `/api` in production. Always on in development. |

## Run with Docker

### Build and start

```bash
docker-compose up --build
```

The app runs on port `3000`. SQLite data is persisted in a named volume (`sqlite_data`).

## API Documentation

Interactive Swagger UI is available at: `http://localhost:3000/api`

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products (supports `?limit=10&offset=0`) |
| GET | `/products/:id` | Get product by UUID |
| POST | `/products` | Create a product |
| PATCH | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |

### Catalogs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/catalogs` | List all catalogs (supports `?limit=10&offset=0`) |
| GET | `/catalogs/:id` | Get catalog by UUID |
| POST | `/catalogs` | Create a catalog |
| PATCH | `/catalogs/:id` | Update a catalog |
| DELETE | `/catalogs/:id` | Delete a catalog |

### Catalog–Product Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/catalogs/:catalogId/products/:productId` | Assign product to catalog |
| DELETE | `/catalogs/:catalogId/products/:productId` | Remove product from catalog |
| GET | `/catalogs/:catalogId/products` | List products in a catalog |

## Many-to-Many Relationship Design

Products and Catalogs have a **many-to-many** relationship:

- A product (e.g., *iPhone 15 Pro*) can appear in multiple catalogs (*Smartphones*, *New Arrivals*)
- A catalog (e.g., *New Arrivals*) can contain multiple products from different categories

This is implemented via a `catalog_products` join table owned by the `Catalog` entity (`@JoinTable`). TypeORM manages the join table automatically — you interact with it only through `POST /catalogs/:id/products/:id` and `DELETE /catalogs/:id/products/:id`.

This reflects real-world requirements where promotional catalogs (*New Arrivals*, *Sale*) overlap with category catalogs (*Smartphones*, *Laptops*).

## Replacing SQLite

The database is configured in one place: `src/app.module.ts`. To switch to PostgreSQL:

```ts
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Product, Catalog],
  synchronize: false, // use migrations in production
})
```

No other code changes required.

## Tests

```bash
npm test            # 20 unit tests (services)
npm run test:cov    # unit tests with coverage report
npm run test:e2e    # 9 e2e tests (HTTP + in-memory SQLite)
```

- **Unit tests** (20): `ProductsService` and `CatalogsService` — CRUD, pagination, assignment idempotency, removal, error paths.
- **E2E tests** (9): boot the full Nest app against an isolated in-memory SQLite, exercise the HTTP layer with `supertest`, including the full assign → list → remove flow and validation error responses.

## Database migrations

Migrations live in `src/database/migrations/` and are managed via the TypeORM CLI.

```bash
npm run migration:generate    # diff entities vs DB and emit a new migration
npm run migration:run         # apply pending migrations
npm run migration:revert      # roll back the last migration
```

In production (`NODE_ENV=production`) the app runs pending migrations automatically on startup and `synchronize` is disabled. In development the schema is kept in sync with the entities via `synchronize: true`, so you can iterate without running migrations.
