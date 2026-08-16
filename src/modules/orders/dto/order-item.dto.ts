import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'ID of the product being ordered',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Product is required' })
  productId!: string;

  @ApiProperty({
    description: 'Quantity of the product being ordered',
    example: 2,
  })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    description:
      'Unit price the client last saw for this product, used to detect price changes since the item was added to the cart. This is not trusted for billing — the server always charges the current product price',
    example: 29.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;
}
