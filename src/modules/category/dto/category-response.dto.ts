import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '12334-hd7d-8383j-hd8dg738276dh',
  })
  id!: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  name!: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Phones, laptops and other electronic devices',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'URL-friendly unique identifier for the category',
    example: 'electronics',
  })
  slug!: string;

  @ApiProperty({
    description: 'Category image URL',
    example: 'https://example.com/images/electronics.png',
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Number of products in this category',
    example: '150',
  })
  productCount!: number;

  @ApiProperty({
    description: 'Category creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last category update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
