import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteUploadDto {
  @ApiProperty({
    description: 'Cloudinary public ID of the image to delete',
    example: 'nest-commerce/products/abc123',
  })
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
