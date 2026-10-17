import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'ID of the product to add to the cart',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Product is required' })
  productId!: string;

  @ApiProperty({
    description: 'Quantity to add',
    example: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
