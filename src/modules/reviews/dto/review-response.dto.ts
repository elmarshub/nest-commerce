import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Review ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID of the product being reviewed',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId!: string;

  @ApiProperty({
    description: 'ID of the reviewer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Name of the reviewer',
    example: 'Jane Doe',
  })
  userName!: string;

  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
  })
  rating!: number;

  @ApiProperty({
    description: 'Written review',
    example: 'Great product, works exactly as described!',
    nullable: true,
  })
  comment!: string | null;

  @ApiProperty({
    description: 'Review creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last review update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
