import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from './entities/catalog.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { PaginationDto } from '../products/dto/pagination.dto';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Catalog)
    private readonly catalogsRepository: Repository<Catalog>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createCatalogDto: CreateCatalogDto): Promise<Catalog> {
    const catalog = this.catalogsRepository.create(createCatalogDto);
    return this.catalogsRepository.save(catalog);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ data: Catalog[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination;
    const [data, total] = await this.catalogsRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: string): Promise<Catalog> {
    const catalog = await this.catalogsRepository.findOne({ where: { id } });
    if (!catalog) {
      throw new NotFoundException(`Catalog with id "${id}" not found`);
    }
    return catalog;
  }

  async update(
    id: string,
    updateCatalogDto: UpdateCatalogDto,
  ): Promise<Catalog> {
    const catalog = await this.findOne(id);
    Object.assign(catalog, updateCatalogDto);
    return this.catalogsRepository.save(catalog);
  }

  async remove(id: string): Promise<void> {
    const catalog = await this.findOne(id);
    await this.catalogsRepository.remove(catalog);
  }

  async assignProduct(catalogId: string, productId: string): Promise<Catalog> {
    const catalog = await this.catalogsRepository.findOne({
      where: { id: catalogId },
      relations: ['products'],
    });
    if (!catalog) {
      throw new NotFoundException(`Catalog with id "${catalogId}" not found`);
    }

    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }

    const alreadyAssigned = catalog.products.some((p) => p.id === productId);
    if (!alreadyAssigned) {
      catalog.products.push(product);
      await this.catalogsRepository.save(catalog);
    }

    return this.catalogsRepository.findOne({
      where: { id: catalogId },
      relations: ['products'],
    }) as Promise<Catalog>;
  }

  async removeProduct(catalogId: string, productId: string): Promise<Catalog> {
    const catalog = await this.catalogsRepository.findOne({
      where: { id: catalogId },
      relations: ['products'],
    });
    if (!catalog) {
      throw new NotFoundException(`Catalog with id "${catalogId}" not found`);
    }

    const productIndex = catalog.products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      throw new NotFoundException(
        `Product with id "${productId}" is not in catalog "${catalogId}"`,
      );
    }

    catalog.products.splice(productIndex, 1);
    await this.catalogsRepository.save(catalog);

    return this.catalogsRepository.findOne({
      where: { id: catalogId },
      relations: ['products'],
    }) as Promise<Catalog>;
  }

  async getCatalogProducts(
    catalogId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Product[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination;

    const catalog = await this.catalogsRepository.findOne({
      where: { id: catalogId },
      relations: ['products'],
    });
    if (!catalog) {
      throw new NotFoundException(`Catalog with id "${catalogId}" not found`);
    }

    const total = catalog.products.length;
    const data = catalog.products.slice(offset, offset + limit);
    return { data, total };
  }
}
