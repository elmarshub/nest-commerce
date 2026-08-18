import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Review, User } from '@generated/prisma/client';
import { OrderStatus, Role } from '@generated/prisma/enums';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { PaginatedReviewsResponseDto } from './dto/paginated-reviews-response.dto';

const VERIFIED_PURCHASE_STATUSES: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    productId: string,
    data: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: VERIFIED_PURCHASE_STATUSES } },
      },
    });

    if (!hasPurchased) {
      throw new ForbiddenException(
        'You can only review products you have purchased',
      );
    }

    try {
      const review = await this.prisma.review.create({
        data: { ...data, userId, productId },
        include: { user: true },
      });

      return this.formatReview(review);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already reviewed this product');
      }

      throw error;
    }
  }

  async findAllForProduct(
    productId: string,
    query: QueryReviewDto,
  ): Promise<PaginatedReviewsResponseDto> {
    const { page = 1, limit = 10 } = query;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);

    return {
      data: reviews.map((review) => this.formatReview(review)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    userId: string,
    id: string,
    data: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    await this.getOwnedReview(userId, id);

    const review = await this.prisma.review.update({
      where: { id },
      data,
      include: { user: true },
    });

    return this.formatReview(review);
  }

  async remove(
    userId: string,
    role: Role,
    id: string,
  ): Promise<{ message: string }> {
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('This review does not belong to you');
    }

    await this.prisma.review.delete({ where: { id } });

    return { message: 'Review deleted successfully' };
  }

  private async getOwnedReview(userId: string, id: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review || review.userId !== userId) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  private formatReview(review: Review & { user: User }): ReviewResponseDto {
    const userName =
      `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() ||
      review.user.email;

    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
