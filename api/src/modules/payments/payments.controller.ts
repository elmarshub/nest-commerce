import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { AuditLogService } from '@/audit-log/audit-log.service';
import { AuditAction } from '@/audit-log/audit-log.constants';
import { StrictThrottle } from '@/common/decorators/custom-throttler.decorator';
import { Role } from '@generated/prisma/enums';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  type RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentsWebhookService } from './payments-webhook.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentApiResponseDto } from './dto/payment-api-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaginatedPaymentsResponseDto } from './dto/paginated-payments-response.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly paymentsWebhookService: PaymentsWebhookService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('create-intent')
  @ApiBearerAuth('JWT-auth')
  @StrictThrottle()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a payment intent for an order',
    description:
      'Creates a Stripe PaymentIntent for the given order and returns the client secret needed to confirm payment on the frontend',
  })
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiResponse({
    status: 201,
    description: 'The created payment intent',
    type: PaymentApiResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'This order does not belong to you',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'This order has already been paid' })
  async createIntent(
    @GetUser('id') userId: string,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentApiResponseDto> {
    return await this.paymentService.createIntent(
      userId,
      createPaymentIntentDto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all payments (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of payments retrieved successfully',
    type: PaginatedPaymentsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query() queryDto: QueryPaymentDto,
  ): Promise<PaginatedPaymentsResponseDto> {
    return await this.paymentService.findAll(queryDto);
  }

  @Get('order/:orderId')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the payment for a given order' })
  @ApiParam({ name: 'orderId', description: 'The order id' })
  @ApiResponse({
    status: 200,
    description: 'The payment for this order',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'This payment does not belong to you',
  })
  @ApiResponse({ status: 404, description: 'Payment not found for this order' })
  async findByOrderId(
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
    @Param('orderId') orderId: string,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.findByOrderId(userId, role, orderId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a payment by id' })
  @ApiParam({ name: 'id', description: 'The payment id' })
  @ApiResponse({
    status: 200,
    description: 'The payment',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'This payment does not belong to you',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.findOne(userId, role, id);
  }

  @Post(':id/sync')
  @ApiBearerAuth('JWT-auth')
  @StrictThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reconcile a payment with Stripe',
    description:
      'Fetches the current status directly from Stripe and updates the local payment/order if needed. Intended as a fallback for the frontend to call right after confirming payment client-side, in case the webhook has not arrived yet.',
  })
  @ApiParam({ name: 'id', description: 'The payment id' })
  @ApiResponse({
    status: 200,
    description: 'The reconciled payment',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'This payment does not belong to you',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async syncPayment(
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.syncPayment(userId, role, id);
  }

  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @StrictThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refund a payment (admin only)',
    description:
      'Refunds the payment via Stripe, restores product stock, and cancels the associated order',
  })
  @ApiParam({ name: 'id', description: 'The payment id' })
  @ApiResponse({
    status: 200,
    description: 'The refunded payment',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({
    status: 400,
    description: 'Payment is not in a refundable state',
  })
  async refund(
    @GetUser('id') actorId: string,
    @GetUser('email') actorEmail: string,
    @Param('id') id: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentService.refund(id);

    await this.auditLogService.record({
      actor: { id: actorId, email: actorEmail },
      action: AuditAction.PAYMENT_REFUNDED,
      targetType: 'Payment',
      targetId: id,
      metadata: { amount: payment.amount, orderId: payment.orderId },
    });

    return payment;
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!request.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    return await this.paymentsWebhookService.handleWebhook(
      signature,
      request.rawBody,
    );
  }
}
