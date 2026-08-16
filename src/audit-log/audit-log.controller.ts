import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@generated/prisma/enums';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { PaginatedAuditLogsResponseDto } from './dto/paginated-audit-logs-response.dto';

@ApiTags('Audits')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List admin actions (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of audit log entries',
    type: PaginatedAuditLogsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query() queryDto: QueryAuditLogDto,
  ): Promise<PaginatedAuditLogsResponseDto> {
    return await this.auditLogService.findAll(queryDto);
  }
}
