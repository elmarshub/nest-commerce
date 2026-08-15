import { ApiProperty } from '@nestjs/swagger';

export class UsersResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '12334-hd7d-8383j-hd8dg738276dh',
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
    nullable: true,
  })
  firstName!: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    nullable: true,
  })
  lastName!: string | null;

  @ApiProperty({
    description: 'Users role',
    example: 'ADMIN',
  })
  role!: string;

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
