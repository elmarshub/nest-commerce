import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@generated/prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from './audit-log.constants';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { PaginatedAuditLogsResponseDto } from './dto/paginated-audit-logs-response.dto';

interface RecordAuditLogInput {
  actor: { id: string; email: string };
  action: AuditAction;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  async record(
    { actor, action, targetType, targetId, metadata }: RecordAuditLogInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const create = () =>
      client.auditLog.create({
        data: {
          actorId: actor.id,
          actorEmail: actor.email,
          action,
          targetType,
          targetId,
          metadata: metadata as unknown as Prisma.InputJsonValue | undefined,
        },
      });

    if (tx) {
      await create();
      return;
    }

    try {
      await create();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to record audit log for ${action}: ${message}`);
    }
  }

  async findAll(
    query: QueryAuditLogDto,
  ): Promise<PaginatedAuditLogsResponseDto> {
    const { page = 1, limit = 20, action, actorId } = query;

    const where: Prisma.AuditLogWhereInput = {
      ...(action && { action }),
      ...(actorId && { actorId }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        ...log,
        metadata: log.metadata as Record<string, unknown> | null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
