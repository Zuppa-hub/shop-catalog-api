import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Catalog } from '../catalogs/entities/catalog.entity';

const dataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH ?? 'shop.sqlite',
  entities: [Product, Catalog],
  synchronize: true,
});

const products = [
  {
    name: 'iPhone 15 Pro',
    description: 'Apple flagship with titanium frame and A17 Pro chip',
    price: 1199.99,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung flagship with built-in S Pen and 200MP camera',
    price: 1299.99,
  },
  {
    name: 'Google Pixel 8 Pro',
    description: 'Google flagship with Tensor G3 chip and AI features',
    price: 999.99,
  },
  {
    name: 'MacBook Pro 16"',
    description: 'Apple laptop with M3 Max chip and Liquid Retina XDR display',
    price: 3499.99,
  },
  {
    name: 'Dell XPS 15',
    description:
      'Premium Windows laptop with OLED display and 13th Gen Intel Core',
    price: 1899.99,
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancelling wireless headphones',
    price: 349.99,
  },
  {
    name: 'Apple AirPods Pro 2',
    description: 'Active noise cancellation earbuds with USB-C charging',
    price: 249.99,
  },
  {
    name: 'iPad Pro 12.9"',
    description: 'Most powerful iPad with M2 chip and Liquid Retina XDR',
    price: 1099.99,
  },
  {
    name: 'Samsung 65" QLED 4K TV',
    description: 'Quantum Dot technology with Neo QLED and 120Hz refresh',
    price: 1499.99,
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Advanced health monitoring with double tap gesture',
    price: 399.99,
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse with 8K DPI sensor',
    price: 99.99,
  },
  {
    name: 'USB-C Hub 7-in-1',
    description: 'Multiport adapter with HDMI, USB-A, SD card reader',
    price: 49.99,
  },
];

const catalogs = [
  {
    name: 'Smartphones',
    description: 'Latest smartphones and mobile devices from top brands',
  },
  {
    name: 'Laptops',
    description: 'High-performance laptops for work and creativity',
  },
  {
    name: 'Accessories',
    description: 'Essential accessories to complement your devices',
  },
  {
    name: 'New Arrivals',
    description: 'The latest products just added to our store',
  },
];

// Maps catalog index to product indices (0-based)
const assignments: Record<number, number[]> = {
  0: [0, 1, 2], // Smartphones: iPhone, Galaxy, Pixel
  1: [3, 4, 7], // Laptops: MacBook, Dell XPS, iPad Pro
  2: [5, 6, 9, 10, 11], // Accessories: headphones, AirPods, Watch, mouse, hub
  3: [0, 3, 6, 9, 10], // New Arrivals: iPhone, MacBook, AirPods, Watch, mouse
};

async function seed() {
  await dataSource.initialize();
  console.log('Database connection established');

  const productRepo = dataSource.getRepository(Product);
  const catalogRepo = dataSource.getRepository(Catalog);

  // Clear existing data
  await dataSource.query('DELETE FROM catalog_products');
  await dataSource.query('DELETE FROM products');
  await dataSource.query('DELETE FROM catalogs');
  console.log('Cleared existing data');

  // Insert products
  const savedProducts = await productRepo.save(productRepo.create(products));
  console.log(`Seeded ${savedProducts.length} products`);

  // Insert catalogs
  const savedCatalogs = await catalogRepo.save(catalogRepo.create(catalogs));
  console.log(`Seeded ${savedCatalogs.length} catalogs`);

  // Assign products to catalogs
  for (const [catalogIdx, productIndices] of Object.entries(assignments)) {
    const catalog = savedCatalogs[parseInt(catalogIdx)];
    catalog.products = productIndices.map((i) => savedProducts[i]);
    await catalogRepo.save(catalog);
  }
  console.log('Assigned products to catalogs');

  await dataSource.destroy();
  console.log('Seed completed successfully');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
