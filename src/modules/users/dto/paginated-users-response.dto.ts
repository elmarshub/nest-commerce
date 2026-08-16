import { ApiProperty } from '@nestjs/swagger';
import { UsersResponseDto } from './user-response.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UsersResponseDto] })
  users!: UsersResponseDto[];

  @ApiProperty({ description: 'Total number of users', example: 42 })
  total!: number;
}
