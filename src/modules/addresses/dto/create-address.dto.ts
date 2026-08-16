import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'A short label to identify this address',
    example: 'Home',
    required: false,
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @ApiProperty({
    description: 'Street address, first line',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty({ message: 'Address line 1 is required' })
  line1!: string;

  @ApiProperty({
    description: 'Street address, second line',
    example: 'Apt 4B',
    required: false,
  })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({
    description: 'City',
    example: 'Springfield',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @ApiProperty({
    description: 'State or province',
    example: 'IL',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'Postal or ZIP code',
    example: '62704',
  })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  postalCode!: string;

  @ApiProperty({
    description: 'Country',
    example: 'US',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country!: string;

  @ApiProperty({
    description: 'Contact phone number for delivery',
    example: '+1-555-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Whether this should become the default address',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
