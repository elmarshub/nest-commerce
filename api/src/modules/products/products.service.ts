/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { PrismaService } from '@/prisma/prisma.service';
import { Category, Prisma, Product } from '@generated/prisma/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto, StockOperation } from './dto/update-stock.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDto, ProductSortBy } from './dto/query-product.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { AuditLogService } from '@/audit-log/audit-log.service';
import { AuditAction } from '@/audit-log/audit-log.constants';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(data: CreateProductDto): Promise<ProductResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Product with this SKU ${data.sku} already exists`,
      );
    }

    const product = await this.prisma.product.create({
      data: { ...data, price: new Prisma.Decimal(data.price) },
      include: { category: true, reviews: { select: { rating: true } } },
    });

    return this.formatProduct(product);
  }

  async findAll(query: QueryProductDto): Promise<PaginatedProductsResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      isActive,
      minPrice,
      maxPrice,
      inStock,
      sortBy = ProductSortBy.CREATED_AT,
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
      ...(inStock !== undefined && {
        stock: inStock ? { gt: 0 } : { lte: 0 },
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: products.map((product) => product.id) } },
      _avg: { rating: true },
      _count: true,
    });
    const ratingsByProductId = new Map(
      ratings.map((rating) => [rating.productId, rating]),
    );

    return {
      data: products.map((product) => {
        const rating = ratingsByProductId.get(product.id);

        return this.formatProduct(
          { ...product, reviews: [] },
          {
            reviewCount: rating?._count ?? 0,
            averageRating: rating?._avg.rating ?? null,
          },
        );
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { select: { rating: true } } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(product);
  }

  async update(
    id: string,
    data: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (data.sku) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException(
          `Product with this SKU ${data.sku} already exists`,
        );
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.price !== undefined && {
          price: new Prisma.Decimal(data.price),
        }),
      },
      include: { category: true, reviews: { select: { rating: true } } },
    });

    return this.formatProduct(updatedProduct);
  }

  async updateStock(
    id: string,
    { quantity, operation = StockOperation.SET }: UpdateStockDto,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where:
          operation === StockOperation.DECREMENT
            ? { id, stock: { gte: quantity } }
            : { id },
        data: {
          stock:
            operation === StockOperation.INCREMENT
              ? { increment: quantity }
              : operation === StockOperation.DECREMENT
                ? { decrement: quantity }
                : quantity,
        },
        include: { category: true, reviews: { select: { rating: true } } },
      });

      return this.formatProduct(updatedProduct);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException('Resulting stock cannot be negative');
      }

      throw error;
    }
  }

  async remove(
    id: string,
    actor: { id: string; email: string },
  ): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: { select: { orderItems: true, cartItems: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product._count.orderItems > 0) {
      throw new ConflictException(
        'Cannot delete a product that has existing orders',
      );
    }

    if (product._count.cartItems > 0) {
      throw new ConflictException(
        'Cannot delete a product that is currently in a cart',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });

      await this.auditLogService.record(
        {
          actor,
          action: AuditAction.PRODUCT_DELETED,
          targetType: 'Product',
          targetId: id,
        },
        tx,
      );
    });

    return { message: 'Product deleted successfully' };
  }

  private formatProduct(
    product: Product & {
      category: Category;
      reviews: { rating: number }[];
    },
    ratingStats?: { reviewCount: number; averageRating: number | null },
  ): ProductResponseDto {
    const reviewCount = ratingStats?.reviewCount ?? product.reviews.length;
    const rawAverageRating =
      ratingStats?.averageRating ??
      (reviewCount > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : null);
    const averageRating =
      rawAverageRating !== null ? Math.round(rawAverageRating * 10) / 10 : null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      sku: product.sku,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      categoryId: product.categoryId,
      category: product.category,
      averageRating,
      reviewCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
