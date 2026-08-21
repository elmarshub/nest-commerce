import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import {
  Order,
  OrderItem,
  Prisma,
  Product,
  User,
} from '@generated/prisma/client';
import { OrderStatus } from '@generated/prisma/enums';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { PaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaymentStatus } from '@generated/prisma/enums';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
  ) {}

  async create(
    userId: string,
    { shippingAddress }: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { userId, checkedOut: false },
        include: { cartItems: { include: { product: true } } },
      });

      if (!cart || cart.cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      const { count } = await tx.cart.updateMany({
        where: { id: cart.id, checkedOut: false },
        data: { checkedOut: true },
      });

      if (count !== 1) {
        throw new BadRequestException('Your cart is empty');
      }

      let totalAmount = new Prisma.Decimal(0);
      const orderItemsData: {
        productId: string;
        quantity: number;
        price: Prisma.Decimal;
      }[] = [];

      for (const item of cart.cartItems) {
        const { product } = item;

        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.name}" is not available`,
          );
        }

        try {
          await tx.product.update({
            where: { id: product.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new BadRequestException(
              `Insufficient stock for product "${product.name}"`,
            );
          }

          throw error;
        }

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        totalAmount = totalAmount.add(product.price.mul(item.quantity));
      }

      return await tx.order.create({
        data: {
          userId,
          cartId: cart.id,
          shippingAddress,
          totalAmount,
          orderItems: { create: orderItemsData },
        },
        include: {
          orderItems: { include: { product: true } },
          user: true,
        },
      });
    });

    const formatted = this.formatOrder(order);

    await this.emailService.sendOrderConfirmationEmail(order.user.email, {
      orderNumber: formatted.orderNumber,
      totalAmount: formatted.totalAmount,
    });

    return formatted;
  }

  async findAllForUser(
    userId: string,
    query: QueryOrderDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.findAllForAdmin({ ...query, userId });
  }

  async findAllForAdmin(
    query: QueryOrderDto,
  ): Promise<PaginatedOrdersResponseDto> {
    const { page = 1, limit = 10, status, userId } = query;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
      ...(userId && { userId }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { product: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.formatOrder(order)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForUser(userId: string, id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.formatOrder(order);
  }

  async findOneForAdmin(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.formatOrder(order);
  }

  async updateForAdmin(
    id: string,
    { status, trackingNumber, notes }: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    try {
      if (status) {
        const existing = await this.prisma.order.findUnique({
          where: { id },
          select: { status: true },
        });

        if (!existing) {
          throw new NotFoundException(`Order ${id} not found`);
        }

        if (
          existing.status === OrderStatus.CANCELLED &&
          status !== OrderStatus.CANCELLED
        ) {
          throw new BadRequestException(
            'Cannot change the status of a cancelled order',
          );
        }
      }

      const order = await this.prisma.order.update({
        where: { id },
        data: { status, trackingNumber, notes },
        include: {
          orderItems: { include: { product: true } },
          user: true,
        },
      });

      const formatted = this.formatOrder(order);

      if (status) {
        await this.emailService.sendOrderStatusUpdateEmail(order.user.email, {
          orderNumber: formatted.orderNumber,
          status: formatted.status,
          trackingNumber: formatted.trackingNumber,
        });
      }

      return formatted;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Order ${id} not found`);
      }

      throw error;
    }
  }

  async cancelForUser(userId: string, id: string): Promise<OrderResponseDto> {
    return this.cancelOrder({ id, userId }, [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
    ]);
  }

  async cancelForAdmin(id: string): Promise<OrderResponseDto> {
    return this.cancelOrder({ id }, [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
    ]);
  }

  private async cancelOrder(
    where: Prisma.OrderWhereInput,
    allowedStatuses: OrderStatus[],
  ): Promise<OrderResponseDto> {
    const orderWithPayment = await this.prisma.order.findFirst({
      where,
      include: { payment: true },
    });

    if (!orderWithPayment) {
      throw new NotFoundException('Order not found');
    }

    if (!allowedStatuses.includes(orderWithPayment.status)) {
      throw new BadRequestException(
        `Order with status "${orderWithPayment.status}" cannot be cancelled`,
      );
    }

    if (orderWithPayment.payment?.status === PaymentStatus.COMPLETED) {
      await this.paymentsService.refund(orderWithPayment.payment.id);
    } else {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.order.findFirst({
          where: { id: orderWithPayment.id, status: { in: allowedStatuses } },
          include: { orderItems: true },
        });

        if (!existing) {
          throw new BadRequestException('Order cannot be cancelled');
        }

        for (const item of existing.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: existing.id },
          data: { status: OrderStatus.CANCELLED },
        });
      });
    }

    const updated = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderWithPayment.id },
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });

    return this.formatOrder(updated);
  }

  private formatOrder(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
  ): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      userEmail: order.user.email,
      userName:
        `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
