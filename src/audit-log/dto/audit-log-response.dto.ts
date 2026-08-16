import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Audit log entry ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the admin who performed the action',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  actorId!: string;

  @ApiProperty({
    description: 'Email of the admin who performed the action',
    example: 'admin@example.com',
  })
  actorEmail!: string;

  @ApiProperty({
    description: 'The action that was performed',
    example: 'PAYMENT_REFUNDED',
  })
  action!: string;

  @ApiProperty({
    description: 'The type of entity the action was performed on',
    example: 'Payment',
  })
  targetType!: string;

  @ApiProperty({
    description: 'The id of the entity the action was performed on',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  targetId!: string | null;

  @ApiProperty({
    description: 'Extra context about the action',
    example: { amount: 59.98 },
    nullable: true,
  })
  metadata!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'When the action was performed',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;
}
