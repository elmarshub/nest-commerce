import { InternalServerErrorException, Provider } from '@nestjs/common';
import Stripe from 'stripe';

export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

export const stripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  useFactory: (): Stripe => {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not configured',
      );
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  },
};
