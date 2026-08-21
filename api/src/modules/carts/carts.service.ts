import { PrismaService } from '@/prisma/prisma.service';
import { Cart, CartItem, Prisma, Product } from '@generated/prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

type CartWithItems = Cart & {
  cartItems: (CartItem & { product: Product })[];
};

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCart(userId);

    return this.formatCart(cart);
  }

  async addItem(
    userId: string,
    { productId, quantity }: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException(
        `Product "${product.name}" is not available`,
      );
    }

    const cart = await this.getOrCreateActiveCart(userId);

    const existingItem = cart.cartItems.find(
      (item) => item.productId === productId,
    );
    const resultingQuantity = (existingItem?.quantity ?? 0) + quantity;

    // this is a fast, friendly early check for the common case — the real,
    // atomic enforcement still happens at checkout (orders.service.ts),
    // since stock can still change between this check and checkout
    if (resultingQuantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} unit(s) of "${product.name}" available`,
      );
    }

    await this.prisma.cartItem.upsert({
      where: { productId_cartId: { productId, cartId: cart.id } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    itemId: string,
    { quantity }: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const item = await this.getOwnedCartItem(userId, itemId);

    if (quantity > item.product.stock) {
      throw new BadRequestException(
        `Only ${item.product.stock} unit(s) of "${item.product.name}" available`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
    await this.getOwnedCartItem(userId, itemId);

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCart(userId);

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.getCart(userId);
  }

  private async getOwnedCartItem(
    userId: string,
    itemId: string,
  ): Promise<CartItem & { product: Product }> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== userId || item.cart.checkedOut) {
      throw new NotFoundException('Cart item not found');
    }

    return item;
  }

  private async getOrCreateActiveCart(userId: string): Promise<CartWithItems> {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, checkedOut: false },
      include: { cartItems: { include: { product: true } } },
    });

    if (existing) {
      return existing;
    }

    try {
      return await this.prisma.cart.create({
        data: { userId },
        include: { cartItems: { include: { product: true } } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const active = await this.prisma.cart.findFirst({
          where: { userId, checkedOut: false },
          include: { cartItems: { include: { product: true } } },
        });

        if (active) {
          return active;
        }
      }

      throw error;
    }
  }

  private formatCart(cart: CartWithItems): CartResponseDto {
    let totalAmount = new Prisma.Decimal(0);

    const items = cart.cartItems.map((item) => {
      const subtotalDecimal = item.product.price.mul(item.quantity);
      totalAmount = totalAmount.add(subtotalDecimal);

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
        subtotal: Number(subtotalDecimal),
        isAvailable:
          item.product.isActive && item.product.stock >= item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: Number(totalAmount),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
