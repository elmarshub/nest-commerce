import { ApiProperty } from '@nestjs/swagger';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the user who placed the order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Email of the user who placed the order',
    example: 'jane.doe@example.com',
  })
  userEmail!: string;

  @ApiProperty({
    description: 'Name of the user who placed the order',
    example: 'Jane Doe',
  })
  userName!: string;

  @ApiProperty({
    description: 'Human-readable order number',
    example: 'clx1y2z3a0000qzrm5f8h2n1',
  })
  orderNumber!: string;

  @ApiProperty({
    description: 'Order status',
    example: 'PENDING',
  })
  status!: string;

  @ApiProperty({
    description: 'Total order amount',
    example: 59.98,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, Springfield, IL 62704',
  })
  shippingAddress!: string;

  @ApiProperty({
    description: 'Shipment tracking number',
    example: '1Z999AA10123456784',
    nullable: true,
  })
  trackingNumber!: string | null;

  @ApiProperty({
    description: 'Internal notes about the order',
    example: 'Customer requested gift wrapping',
    nullable: true,
  })
  notes!: string | null;

  @ApiProperty({
    description: 'Items included in the order',
    type: [OrderItemResponseDto],
  })
  items!: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Order creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last order update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
