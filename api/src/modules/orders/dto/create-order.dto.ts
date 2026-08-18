import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, Springfield, IL 62704',
  })
  @IsString()
  @IsNotEmpty({ message: 'Shipping address is required' })
  shippingAddress!: string;
}
