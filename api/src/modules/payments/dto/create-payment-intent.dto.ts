import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'ID of the order to create a payment intent for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Order is required' })
  orderId!: string;
}
