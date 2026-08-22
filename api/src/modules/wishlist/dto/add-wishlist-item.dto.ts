import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty({
    description: 'ID of the product to add to the wishlist',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Product id is required' })
  productId!: string;
}
