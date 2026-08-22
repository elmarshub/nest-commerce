import { ApiProperty } from '@nestjs/swagger';

export class WishlistItemResponseDto {
  @ApiProperty({
    description: 'Wishlist item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the wishlisted product',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId!: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Mouse',
  })
  productName!: string;

  @ApiProperty({
    description: 'Current price of the product',
    example: 29.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://res.cloudinary.com/demo/image/upload/products/mouse.png',
    type: String,
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({
    description: 'Whether the product is still active/available',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description: 'Wishlist item creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;
}
