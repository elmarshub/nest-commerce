import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { Role, OrderStatus, PaymentStatus } from '@generated/prisma/enums';

@ApiTags('Meta')
@Controller('meta')
export class MetaController {
  @Public()
  @Get('roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all available user roles' })
  @ApiResponse({
    status: 200,
    description: 'List of available roles',
    schema: { type: 'array', items: { type: 'string' } },
  })
  getRoles(): string[] {
    return Object.values(Role);
  }

  @Public()
  @Get('enums')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all enum values used across the API' })
  @ApiResponse({
    status: 200,
    description: 'Map of enum name to its possible values',
    schema: {
      type: 'object',
      additionalProperties: { type: 'array', items: { type: 'string' } },
    },
  })
  getEnums(): Record<string, string[]> {
    return {
      Role: Object.values(Role),
      OrderStatus: Object.values(OrderStatus),
      PaymentStatus: Object.values(PaymentStatus),
    };
  }
}
