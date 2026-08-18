import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the ordered product',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId!: string;

  @ApiProperty({
    description: 'Name of the ordered product',
    example: 'Wireless Mouse',
  })
  productName!: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price at the time of order',
    example: 29.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Subtotal for this item (price × quantity)',
    example: 59.98,
  })
  subtotal!: number;

  @ApiProperty({
    description: 'Order item creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last order item update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
