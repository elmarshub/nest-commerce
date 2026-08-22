import { ApiProperty } from '@nestjs/swagger';
import { PaymentResponseDto } from './payment-response.dto';

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description:
      'URL of the Stripe-hosted Checkout page. Redirect the browser here to complete payment.',
    example: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3',
  })
  url!: string;

  @ApiProperty({
    description: 'The payment record created for this order',
    type: PaymentResponseDto,
  })
  payment!: PaymentResponseDto;
}
