import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Items to include in the order',
    type: [OrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, Springfield, IL 62704',
  })
  @IsString()
  @IsNotEmpty({ message: 'Shipping address is required' })
  shippingAddress!: string;
}
