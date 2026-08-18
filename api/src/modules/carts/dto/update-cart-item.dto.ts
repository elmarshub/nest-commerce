import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for this cart item',
    example: 3,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
