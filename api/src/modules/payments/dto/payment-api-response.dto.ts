import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponseDto } from './payment-response.dto';

export class PaymentApiResponseDto {
  @ApiProperty({
    description:
      'Stripe PaymentIntent client secret, used by the frontend (Stripe.js) to confirm the payment',
    example: 'pi_3Q9x2eKZ8f2s0h1_secret_aBcD1234',
  })
  clientSecret!: string;

  @ApiProperty({
    description: 'The payment record created for this order',
    type: PaymentResponseDto,
  })
  payment!: PaymentResponseDto;
}
