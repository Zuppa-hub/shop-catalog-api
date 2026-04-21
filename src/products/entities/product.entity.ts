import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Catalog } from '../../catalogs/entities/catalog.entity';

const decimalToNumberTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) => {
    if (value === null) {
      return value;
    }

    return typeof value === 'string' ? Number.parseFloat(value) : value;
  },
};

@Entity('products')
export class Product {
  @ApiProperty({ example: 'uuid-v4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'iPhone 15 Pro' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Latest Apple flagship smartphone', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: 999.99 })
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: decimalToNumberTransformer,
  })
  price: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Catalog, (catalog) => catalog.products)
  catalogs: Catalog[];
}
