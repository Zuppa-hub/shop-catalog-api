import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { PaginationDto } from '../products/dto/pagination.dto';
import { Catalog } from './entities/catalog.entity';
import { Product } from '../products/entities/product.entity';

@ApiTags('Catalogs')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new catalog' })
  @ApiResponse({ status: 201, description: 'Catalog created', type: Catalog })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createCatalogDto: CreateCatalogDto): Promise<Catalog> {
    return this.catalogsService.create(createCatalogDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all catalogs with pagination' })
  @ApiResponse({ status: 200, description: 'List of catalogs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(@Query() pagination: PaginationDto) {
    return this.catalogsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a catalog by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Catalog found', type: Catalog })
  @ApiResponse({ status: 404, description: 'Catalog not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Catalog> {
    return this.catalogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a catalog' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Catalog updated', type: Catalog })
  @ApiResponse({ status: 404, description: 'Catalog not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCatalogDto: UpdateCatalogDto,
  ): Promise<Catalog> {
    return this.catalogsService.update(id, updateCatalogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a catalog' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Catalog deleted' })
  @ApiResponse({ status: 404, description: 'Catalog not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.catalogsService.remove(id);
  }

  @Post(':catalogId/products/:productId')
  @ApiOperation({ summary: 'Assign a product to a catalog' })
  @ApiParam({ name: 'catalogId', type: String, format: 'uuid' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiResponse({
    status: 201,
    description: 'Product assigned to catalog',
    type: Catalog,
  })
  @ApiResponse({ status: 404, description: 'Catalog or product not found' })
  assignProduct(
    @Param('catalogId', ParseUUIDPipe) catalogId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<Catalog> {
    return this.catalogsService.assignProduct(catalogId, productId);
  }

  @Delete(':catalogId/products/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a product from a catalog' })
  @ApiParam({ name: 'catalogId', type: String, format: 'uuid' })
  @ApiParam({ name: 'productId', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from catalog',
    type: Catalog,
  })
  @ApiResponse({ status: 404, description: 'Catalog or product not found' })
  removeProduct(
    @Param('catalogId', ParseUUIDPipe) catalogId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<Catalog> {
    return this.catalogsService.removeProduct(catalogId, productId);
  }

  @Get(':catalogId/products')
  @ApiOperation({ summary: 'List products in a catalog' })
  @ApiParam({ name: 'catalogId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Products in catalog' })
  @ApiResponse({ status: 404, description: 'Catalog not found' })
  getCatalogProducts(
    @Param('catalogId', ParseUUIDPipe) catalogId: string,
    @Query() pagination: PaginationDto,
  ): Promise<{ data: Product[]; total: number }> {
    return this.catalogsService.getCatalogProducts(catalogId, pagination);
  }
}
