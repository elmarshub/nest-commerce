import { ApiProperty } from '@nestjs/swagger';
import { ProductCategoryDto } from './product-category.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Mouse',
  })
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'An ergonomic wireless mouse with USB receiver',
    type: String,
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Product price',
    example: 29.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
  })
  stock!: number;

  @ApiProperty({
    description: 'Stock keeping unit',
    example: 'WM-1000',
  })
  sku!: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/wireless-mouse.png',
    type: String,
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'ID of the category this product belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  categoryId!: string;

  @ApiProperty({
    description: 'The category this product belongs to',
    type: ProductCategoryDto,
  })
  category!: ProductCategoryDto;

  @ApiProperty({
    description: 'Average review rating, null if there are no reviews yet',
    example: 4.5,
    type: Number,
    nullable: true,
  })
  averageRating!: number | null;

  @ApiProperty({
    description: 'Number of reviews for this product',
    example: 12,
  })
  reviewCount!: number;

  @ApiProperty({
    description: 'Product creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last product update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
