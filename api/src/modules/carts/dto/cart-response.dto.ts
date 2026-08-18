import { ApiProperty } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  @ApiProperty({
    description: 'Cart ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Items in the cart',
    type: [CartItemResponseDto],
  })
  items!: CartItemResponseDto[];

  @ApiProperty({
    description: 'Total number of items in the cart (sum of quantities)',
    example: 3,
  })
  itemCount!: number;

  @ApiProperty({
    description: 'Total price of all items in the cart',
    example: 89.97,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'Cart creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last cart update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
