import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

const mockProduct: Product = {
  id: 'uuid-1',
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  createdAt: new Date(),
  catalogs: [],
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'Test Product',
        price: 99.99,
      });

      expect(result).toEqual(mockProduct);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Test Product',
        price: 99.99,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockProduct], 1]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual({ data: [mockProduct], total: 1 });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      const updated = { ...mockProduct, name: 'Updated Product' };
      mockRepository.findOne.mockResolvedValue({ ...mockProduct });
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update('uuid-1', {
        name: 'Updated Product',
      });

      expect(result.name).toBe('Updated Product');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
      expect(mockRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
