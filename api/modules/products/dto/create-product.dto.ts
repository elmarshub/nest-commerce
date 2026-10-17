import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Mouse',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'An ergonomic wireless mouse with USB receiver',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product price',
    example: 29.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
    required: false,
    default: 0,
  })
  @ValidateIf((o: CreateProductDto) => o.stock !== undefined)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiProperty({
    description: 'Stock keeping unit, must be unique',
    example: 'WM-1000',
  })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku!: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/wireless-mouse.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
    required: false,
    default: true,
  })
  @ValidateIf((o: CreateProductDto) => o.isActive !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'ID of the category this product belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Category is required' })
  categoryId!: string;
}
