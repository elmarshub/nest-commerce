import { PrismaService } from '@/prisma/prisma.service';
import { Product, WishlistItem } from '@generated/prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';

type WishlistItemWithProduct = WishlistItem & { product: Product };

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<WishlistItemResponseDto[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => this.formatItem(item));
  }

  async add(
    userId: string,
    productId: string,
  ): Promise<WishlistItemResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const item = await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: { product: true },
    });

    return this.formatItem(item);
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    const { count } = await this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });

    if (count === 0) {
      throw new NotFoundException('Wishlist item not found');
    }

    return { message: 'Removed from wishlist' };
  }

  private formatItem(item: WishlistItemWithProduct): WishlistItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      price: Number(item.product.price),
      imageUrl: item.product.imageUrl,
      isAvailable: item.product.isActive,
      createdAt: item.createdAt,
    };
  }
}
