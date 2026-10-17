import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsWebhookService } from './payments-webhook.service';
import { stripeProvider } from './stripe.provider';

@Module({
  controllers: [PaymentsController],
  providers: [stripeProvider, PaymentsService, PaymentsWebhookService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
