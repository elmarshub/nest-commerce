/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { PrismaService } from '@/prisma/prisma.service';
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
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { PaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    { items, shippingAddress }: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.$transaction(async (tx) => {
      let totalAmount = new Prisma.Decimal(0);
      const orderItemsData: {
        productId: string;
        quantity: number;
        price: Prisma.Decimal;
      }[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.name}" is not available`,
          );
        }

        if (!product.price.equals(new Prisma.Decimal(item.price))) {
          throw new ConflictException(
            `Price for "${product.name}" has changed, please refresh your cart`,
          );
        }

        try {
          await tx.product.update({
            where: { id: item.productId, stock: { gte: item.quantity } },
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
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        totalAmount = totalAmount.add(product.price.mul(item.quantity));
      }

      return await tx.order.create({
        data: {
          userId,
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

    return this.formatOrder(order);
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
      const order = await this.prisma.order.update({
        where: { id },
        data: { status, trackingNumber, notes },
        include: {
          orderItems: { include: { product: true } },
          user: true,
        },
      });

      return this.formatOrder(order);
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
    const order = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where,
        include: { orderItems: true },
      });

      if (!existing) {
        throw new NotFoundException('Order not found');
      }

      if (!allowedStatuses.includes(existing.status)) {
        throw new BadRequestException(
          `Order with status "${existing.status}" cannot be cancelled`,
        );
      }

      for (const item of existing.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return await tx.order.update({
        where: { id: existing.id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          orderItems: { include: { product: true } },
          user: true,
        },
      });
    });

    return this.formatOrder(order);
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
