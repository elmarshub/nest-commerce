import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsWebhookService } from './payments-webhook.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsWebhookService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
