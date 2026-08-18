import { GetUser } from '@/common/decorators/get-user.decorator';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from '@/common/decorators/custom-throttler.decorator';
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @RelaxedThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current user's active cart" })
  @ApiResponse({
    status: 200,
    description: 'The current cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return await this.cartsService.getCart(userId);
  }

  @Post('items')
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add an item to the cart',
    description:
      'If the product is already in the cart, its quantity is increased rather than adding a duplicate line',
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'The updated cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Product is not available' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addItem(
    @GetUser('id') userId: string,
    @Body() addCartItemDto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartsService.addItem(userId, addCartItemDto);
  }

  @Patch('items/:itemId')
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the quantity of a cart item' })
  @ApiParam({ name: 'itemId', description: 'The cart item id' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'The updated cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItem(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartsService.updateItem(
      userId,
      itemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:itemId')
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'itemId', description: 'The cart item id' })
  @ApiResponse({
    status: 200,
    description: 'The updated cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    return await this.cartsService.removeItem(userId, itemId);
  }

  @Delete()
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove all items from the cart' })
  @ApiResponse({
    status: 200,
    description: 'The now-empty cart',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clearCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return await this.cartsService.clearCart(userId);
  }
}
