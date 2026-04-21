import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity('catalogs')
export class Catalog {
  @ApiProperty({ example: 'uuid-v4' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Smartphones' })
  @Column()
  name: string;

  @ApiProperty({ example: 'All smartphone products', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  // JoinTable lives on the owning side of the relationship
  @ManyToMany(() => Product, (product) => product.catalogs, { eager: false })
  @JoinTable({
    name: 'catalog_products',
    joinColumn: { name: 'catalogId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];
}
