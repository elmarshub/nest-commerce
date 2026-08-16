import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryDto {
  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  name!: string;

  @ApiProperty({
    description: 'URL-friendly unique identifier for the category',
    example: 'electronics',
  })
  slug!: string;
}
