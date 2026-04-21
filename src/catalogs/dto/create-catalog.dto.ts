import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateCatalogDto {
  @ApiProperty({ example: 'Smartphones', description: 'Catalog name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    example: 'All smartphone and mobile device products',
    description: 'Catalog description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
