import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Secure URL of the uploaded image',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1700000000/nest-commerce/products/abc123.png',
  })
  url!: string;

  @ApiProperty({
    description: 'Cloudinary public ID, needed to delete the image later',
    example: 'nest-commerce/products/abc123',
  })
  publicId!: string;
}
