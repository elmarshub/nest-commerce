import { PrismaService } from '@/prisma/prisma.service';
import { Category, Prisma } from '@generated/prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { PaginatedCategoriesResponseDto } from './dto/paginated-categories-response.dto';
import { AuditLogService } from '@/audit-log/audit-log.service';
import { AuditAction } from '@/audit-log/audit-log.constants';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async create(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    const { name, slug, ...rest } = data;

    const categorySlug =
      slug ??
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    const category = await this.prisma.category.create({
      data: { name, slug: categorySlug, ...rest },
    });

    return this.formatCategory(category, 0);
  }

  async findAll(
    query: QueryCategoryDto,
  ): Promise<PaginatedCategoriesResponseDto> {
    const { page = 1, limit = 10, search, isActive } = query;

    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories.map((category) =>
        this.formatCategory(category, category._count.products),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategory(category, Number(category._count.products));
  }

  async update(
    id: string,
    data: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (data.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    });

    return this.formatCategory(
      updatedCategory,
      Number(updatedCategory._count.products),
    );
  }

  async remove(
    id: string,
    actor: { id: string; email: string },
  ): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        `Cannot delete category with ${category._count.products} products. Remove or reassign first`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });

      if (!current) {
        throw new NotFoundException('Category not found');
      }

      if (current._count.products > 0) {
        throw new ConflictException(
          `Cannot delete category with ${current._count.products} products. Remove or reassign first`,
        );
      }

      try {
        await tx.category.delete({ where: { id } });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2003'
        ) {
          throw new ConflictException(
            'Cannot delete category with existing products. Remove or reassign first',
          );
        }
        throw error;
      }

      await this.auditLogService.record(
        {
          actor,
          action: AuditAction.CATEGORY_DELETED,
          targetType: 'Category',
          targetId: id,
        },
        tx,
      );
    });

    return { message: 'Category deleted successfully' };
  }

  private formatCategory(
    category: Category,
    productCount: number,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
