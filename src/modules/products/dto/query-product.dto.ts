import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryProductDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search products by name or description',
    example: 'wireless mouse',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by category id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return value;
    if (value === 'false' || value === false) return value;
    return undefined;
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Minimum price',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;
}
