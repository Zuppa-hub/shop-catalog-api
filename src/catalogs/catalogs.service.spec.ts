import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { Catalog } from './entities/catalog.entity';
import { Product } from '../products/entities/product.entity';

const mockProduct: Product = {
  id: 'product-uuid-1',
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  createdAt: new Date(),
  catalogs: [],
};

const mockCatalog: Catalog = {
  id: 'catalog-uuid-1',
  name: 'Test Catalog',
  description: 'A test catalog',
  createdAt: new Date(),
  products: [],
};

const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockCatalogRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
};

const mockProductRepo = {
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('CatalogsService', () => {
  let service: CatalogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogsService,
        { provide: getRepositoryToken(Catalog), useValue: mockCatalogRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<CatalogsService>(CatalogsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a catalog', async () => {
      mockCatalogRepo.create.mockReturnValue(mockCatalog);
      mockCatalogRepo.save.mockResolvedValue(mockCatalog);

      const result = await service.create({ name: 'Test Catalog' });

      expect(result).toEqual(mockCatalog);
    });
  });

  describe('findOne', () => {
    it('should return a catalog by id', async () => {
      mockCatalogRepo.findOne.mockResolvedValue(mockCatalog);

      const result = await service.findOne('catalog-uuid-1');

      expect(result).toEqual(mockCatalog);
    });

    it('should throw NotFoundException when not found', async () => {
      mockCatalogRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignProduct', () => {
    it('should assign a product to a catalog and return updated catalog', async () => {
      const catalog = { ...mockCatalog, products: [] };
      mockCatalogRepo.findOne.mockResolvedValue(catalog);
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCatalogRepo.save.mockResolvedValue(catalog);

      const result = await service.assignProduct(
        'catalog-uuid-1',
        'product-uuid-1',
      );

      expect(result.products).toHaveLength(1);
      expect(result.products[0].id).toBe(mockProduct.id);
      expect(mockCatalogRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should not duplicate product assignment', async () => {
      const catalog = { ...mockCatalog, products: [mockProduct] };
      mockCatalogRepo.findOne.mockResolvedValue(catalog);
      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      const result = await service.assignProduct(
        'catalog-uuid-1',
        'product-uuid-1',
      );

      expect(mockCatalogRepo.save).not.toHaveBeenCalled();
      expect(result.products).toHaveLength(1);
    });

    it('should throw NotFoundException for missing catalog', async () => {
      mockCatalogRepo.findOne.mockResolvedValue(null);

      await expect(
        service.assignProduct('non-existent', 'product-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for missing product', async () => {
      mockCatalogRepo.findOne.mockResolvedValue({
        ...mockCatalog,
        products: [],
      });
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(
        service.assignProduct('catalog-uuid-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeProduct', () => {
    it('should remove a product from a catalog and return updated catalog', async () => {
      const catalog = { ...mockCatalog, products: [{ ...mockProduct }] };
      mockCatalogRepo.findOne.mockResolvedValue(catalog);
      mockCatalogRepo.save.mockResolvedValue(catalog);

      const result = await service.removeProduct(
        'catalog-uuid-1',
        'product-uuid-1',
      );

      expect(result.products).toHaveLength(0);
      expect(mockCatalogRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when product not in catalog', async () => {
      mockCatalogRepo.findOne.mockResolvedValue({
        ...mockCatalog,
        products: [],
      });

      await expect(
        service.removeProduct('catalog-uuid-1', 'product-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCatalogProducts', () => {
    it('should return paginated products for an existing catalog', async () => {
      mockCatalogRepo.count.mockResolvedValue(1);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProduct], 1]);

      const result = await service.getCatalogProducts('catalog-uuid-1', {
        limit: 10,
        offset: 0,
      });

      expect(result.data).toEqual([mockProduct]);
      expect(result.total).toBe(1);
      expect(mockProductRepo.createQueryBuilder).toHaveBeenCalledWith(
        'product',
      );
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'product.catalogs',
        'catalog',
        'catalog.id = :catalogId',
        { catalogId: 'catalog-uuid-1' },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should respect limit and offset', async () => {
      mockCatalogRepo.count.mockResolvedValue(1);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 5]);

      const result = await service.getCatalogProducts('catalog-uuid-1', {
        limit: 2,
        offset: 3,
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(3);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(2);
      expect(result.total).toBe(5);
    });

    it('should throw NotFoundException for non-existent catalog', async () => {
      mockCatalogRepo.count.mockResolvedValue(0);

      await expect(
        service.getCatalogProducts('non-existent', { limit: 10, offset: 0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
