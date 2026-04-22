import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1776842170772 implements MigrationInterface {
  name = 'migration1776842170772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "catalogs" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "description" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "description" varchar, "price" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_products" ("catalogId" varchar NOT NULL, "productId" varchar NOT NULL, PRIMARY KEY ("catalogId", "productId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31e9e0954c4983b6d0960ff53b" ON "catalog_products" ("catalogId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9523627ba14f381f7e33cd5c47" ON "catalog_products" ("productId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_31e9e0954c4983b6d0960ff53b"`);
    await queryRunner.query(`DROP INDEX "IDX_9523627ba14f381f7e33cd5c47"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_catalog_products" ("catalogId" varchar NOT NULL, "productId" varchar NOT NULL, CONSTRAINT "FK_31e9e0954c4983b6d0960ff53b7" FOREIGN KEY ("catalogId") REFERENCES "catalogs" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_9523627ba14f381f7e33cd5c47f" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("catalogId", "productId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_catalog_products"("catalogId", "productId") SELECT "catalogId", "productId" FROM "catalog_products"`,
    );
    await queryRunner.query(`DROP TABLE "catalog_products"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_catalog_products" RENAME TO "catalog_products"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31e9e0954c4983b6d0960ff53b" ON "catalog_products" ("catalogId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9523627ba14f381f7e33cd5c47" ON "catalog_products" ("productId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_9523627ba14f381f7e33cd5c47"`);
    await queryRunner.query(`DROP INDEX "IDX_31e9e0954c4983b6d0960ff53b"`);
    await queryRunner.query(
      `ALTER TABLE "catalog_products" RENAME TO "temporary_catalog_products"`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalog_products" ("catalogId" varchar NOT NULL, "productId" varchar NOT NULL, PRIMARY KEY ("catalogId", "productId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "catalog_products"("catalogId", "productId") SELECT "catalogId", "productId" FROM "temporary_catalog_products"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_catalog_products"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_9523627ba14f381f7e33cd5c47" ON "catalog_products" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31e9e0954c4983b6d0960ff53b" ON "catalog_products" ("catalogId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_9523627ba14f381f7e33cd5c47"`);
    await queryRunner.query(`DROP INDEX "IDX_31e9e0954c4983b6d0960ff53b"`);
    await queryRunner.query(`DROP TABLE "catalog_products"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "catalogs"`);
  }
}
