import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({
    description: 'Address ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'A short label to identify this address',
    example: 'Home',
    type: String,
    nullable: true,
  })
  label!: string | null;

  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'Jane Doe',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Street address, first line',
    example: '123 Main St',
  })
  line1!: string;

  @ApiProperty({
    description: 'Street address, second line',
    example: 'Apt 4B',
    type: String,
    nullable: true,
  })
  line2!: string | null;

  @ApiProperty({
    description: 'City',
    example: 'Springfield',
  })
  city!: string;

  @ApiProperty({
    description: 'State or province',
    example: 'IL',
    type: String,
    nullable: true,
  })
  state!: string | null;

  @ApiProperty({
    description: 'Postal or ZIP code',
    example: '62704',
  })
  postalCode!: string;

  @ApiProperty({
    description: 'Country',
    example: 'US',
  })
  country!: string;

  @ApiProperty({
    description: 'Contact phone number for delivery',
    example: '+1-555-123-4567',
    type: String,
    nullable: true,
  })
  phone!: string | null;

  @ApiProperty({
    description: 'Whether this is the default address',
    example: true,
  })
  isDefault!: boolean;

  @ApiProperty({
    description: 'Address creation date',
    example: '2026-10-10T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last address update date',
    example: '2026-10-10T12:34:56.789Z',
  })
  updatedAt!: Date;
}
