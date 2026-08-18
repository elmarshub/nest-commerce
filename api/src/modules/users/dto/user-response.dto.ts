import { Role } from '@generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UsersResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
    nullable: true,
  })
  firstName!: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
    nullable: true,
  })
  lastName!: string | null;

  @ApiProperty({
    description: 'Users role',
    example: 'ADMIN',
    enum: Role,
  })
  role!: Role;

  @ApiProperty({
    description: 'Users account creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last account update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
