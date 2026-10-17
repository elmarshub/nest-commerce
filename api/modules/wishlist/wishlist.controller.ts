import { GetUser } from '@/common/decorators/get-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistItemResponseDto } from './dto/wishlist-item-response.dto';

@ApiTags('Wishlist')
@ApiBearerAuth('JWT-auth')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current user's wishlist" })
  @ApiResponse({
    status: 200,
    description: 'List of wishlist items',
    type: [WishlistItemResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @GetUser('id') userId: string,
  ): Promise<WishlistItemResponseDto[]> {
    return await this.wishlistService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  @ApiBody({ type: AddWishlistItemDto })
  @ApiResponse({
    status: 201,
    description: 'The wishlist item',
    type: WishlistItemResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async add(
    @GetUser('id') userId: string,
    @Body() addWishlistItemDto: AddWishlistItemDto,
  ): Promise<WishlistItemResponseDto> {
    return await this.wishlistService.add(userId, addWishlistItemDto.productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  @ApiParam({ name: 'productId', description: 'The product id' })
  @ApiResponse({ status: 200, description: 'Removed from wishlist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  async remove(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    return await this.wishlistService.remove(userId, productId);
  }
}
