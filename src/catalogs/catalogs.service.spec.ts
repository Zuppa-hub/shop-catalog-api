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

const mockCatalogRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
};

const mockProductRepo = {
  findOne: jest.fn(),
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
    it('should assign a product to a catalog', async () => {
      const catalogWithProducts = { ...mockCatalog, products: [] };
      const savedCatalog = { ...mockCatalog, products: [mockProduct] };

      mockCatalogRepo.findOne
        .mockResolvedValueOnce(catalogWithProducts)
        .mockResolvedValueOnce(savedCatalog);
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCatalogRepo.save.mockResolvedValue(savedCatalog);

      const result = await service.assignProduct(
        'catalog-uuid-1',
        'product-uuid-1',
      );

      expect(result.products).toHaveLength(1);
      expect(mockCatalogRepo.save).toHaveBeenCalled();
    });

    it('should not duplicate product assignment', async () => {
      const catalogWithProduct = { ...mockCatalog, products: [mockProduct] };
      mockCatalogRepo.findOne
        .mockResolvedValueOnce(catalogWithProduct)
        .mockResolvedValueOnce(catalogWithProduct);
      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      await service.assignProduct('catalog-uuid-1', 'product-uuid-1');

      // save should NOT be called since product already in catalog
      expect(mockCatalogRepo.save).not.toHaveBeenCalled();
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
    it('should remove a product from a catalog', async () => {
      const catalogWithProduct = { ...mockCatalog, products: [mockProduct] };
      const catalogEmpty = { ...mockCatalog, products: [] };

      mockCatalogRepo.findOne
        .mockResolvedValueOnce(catalogWithProduct)
        .mockResolvedValueOnce(catalogEmpty);
      mockCatalogRepo.save.mockResolvedValue(catalogEmpty);

      const result = await service.removeProduct(
        'catalog-uuid-1',
        'product-uuid-1',
      );

      expect(result.products).toHaveLength(0);
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
});
