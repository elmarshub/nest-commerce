import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the order this payment is for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  orderId!: string;

  @ApiProperty({
    description: 'ID of the user who made the payment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 59.98,
  })
  amount!: number;

  @ApiProperty({
    description: 'Payment currency (ISO 4217)',
    example: 'usd',
  })
  currency!: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'PENDING',
  })
  status!: string;

  @ApiProperty({
    description: 'Payment method used',
    example: 'card',
    nullable: true,
  })
  paymentMethod!: string | null;

  @ApiProperty({
    description: 'Payment provider transaction ID',
    example: 'pi_3Q9x2eKZ8f2s0h1',
    nullable: true,
  })
  transactionId!: string | null;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last payment update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
