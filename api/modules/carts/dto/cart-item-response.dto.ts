import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({
    description: 'Cart item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the product in the cart',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId!: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Mouse',
  })
  productName!: string;

  @ApiProperty({
    description: 'Current price of the product (always live, never stale)',
    example: 29.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Quantity in the cart',
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    description: 'price × quantity',
    example: 59.98,
  })
  subtotal!: number;

  @ApiProperty({
    description: 'Whether the product is still active/available',
    example: true,
  })
  isAvailable!: boolean;

  @ApiProperty({
    description: 'Cart item creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last cart item update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
