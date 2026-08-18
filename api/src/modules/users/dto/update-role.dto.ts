import { Role } from '@generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'The role to assign to this user',
    enum: Role,
    example: 'ADMIN',
  })
  @IsEnum(Role)
  role!: Role;
}
