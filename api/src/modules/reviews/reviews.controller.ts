import { GetUser } from '@/common/decorators/get-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Role } from '@generated/prisma/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { PaginatedReviewsResponseDto } from './dto/paginated-reviews-response.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('products/:productId/reviews')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Review a product',
    description:
      'Only users who have purchased the product (order status processing, shipped or delivered) can review it. One review per user per product.',
  })
  @ApiParam({ name: 'productId', description: 'The product id' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'The created review',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'You can only review products you have purchased',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 409,
    description: 'You have already reviewed this product',
  })
  async create(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewsService.create(userId, productId, createReviewDto);
  }

  @Public()
  @Get('products/:productId/reviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiParam({ name: 'productId', description: 'The product id' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reviews',
    type: PaginatedReviewsResponseDto,
  })
  async findAllForProduct(
    @Param('productId') productId: string,
    @Query() queryDto: QueryReviewDto,
  ): Promise<PaginatedReviewsResponseDto> {
    return await this.reviewsService.findAllForProduct(productId, queryDto);
  }

  @Patch('reviews/:id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update your own review' })
  @ApiParam({ name: 'id', description: 'The review id' })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({
    status: 200,
    description: 'The updated review',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewsService.update(userId, id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a review (own review, or any as admin)' })
  @ApiParam({ name: 'id', description: 'The review id' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return await this.reviewsService.remove(userId, role, id);
  }
}
