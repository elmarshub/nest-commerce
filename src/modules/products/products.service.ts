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
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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
      include: { category: true },
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
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => this.formatProduct(product)),
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
      include: { category: true },
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
      include: { category: true },
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

    const newStock =
      operation === StockOperation.INCREMENT
        ? product.stock + quantity
        : operation === StockOperation.DECREMENT
          ? product.stock - quantity
          : quantity;

    if (newStock < 0) {
      throw new BadRequestException('Resulting stock cannot be negative');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
      include: { category: true },
    });

    return this.formatProduct(updatedProduct);
  }

  async remove(id: string): Promise<{ message: string }> {
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

    await this.prisma.product.delete({ where: { id } });

    return { message: 'Product deleted successfully' };
  }

  private formatProduct(
    product: Product & { category: Category },
  ): ProductResponseDto {
    return {
      ...product,
      price: Number(product.price),
    };
  }
}
