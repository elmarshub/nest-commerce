import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from '@/common/decorators/custom-throttler.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { PaginatedOrdersResponseDto } from './dto/paginated-orders-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Role } from '@generated/prisma/enums';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @ModerateThrottle()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order from the current cart',
    description:
      "Checks out the current user's active cart: validates stock and product availability, creates the order, and clears the cart",
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'The created order',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Cart is empty, a product is no longer available, or there is insufficient stock',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @GetUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.create(userId, createOrderDto);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of orders',
    type: PaginatedOrdersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllForAdmin(
    @Query() queryDto: QueryOrderDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return await this.orderService.findAllForAdmin(queryDto);
  }

  @Get()
  @RelaxedThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current user's orders" })
  @ApiResponse({
    status: 200,
    description: "Paginated list of the current user's orders",
    type: PaginatedOrdersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @GetUser('id') userId: string,
    @Query() queryDto: QueryOrderDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return await this.orderService.findAllForUser(userId, queryDto);
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an order by id (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The order',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOneForAdmin(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.findOneForAdmin(id);
  }

  @Get(':id')
  @RelaxedThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get one of the current user's orders by id" })
  @ApiResponse({
    status: 200,
    description: 'The order',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return await this.orderService.findOneForUser(userId, id);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an order (admin only)' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'The updated order',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateForAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.orderService.updateForAdmin(id, updateOrderDto);
  }

  @Patch(':id/cancel')
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel one of the current user's orders" })
  @ApiResponse({
    status: 200,
    description: 'The cancelled order',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancel(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return await this.orderService.cancelForUser(userId, id);
  }

  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The cancelled order',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelForAdmin(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.cancelForAdmin(id);
  }
}
