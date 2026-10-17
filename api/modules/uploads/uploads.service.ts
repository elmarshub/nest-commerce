import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import { UploadFolder } from './uploads.constants';
import { UploadResponseDto } from './dto/upload-response.dto';

const CLOUDINARY_ROOT_FOLDER = 'nest-commerce';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadImage(
    file: Express.Multer.File | undefined,
    folder: UploadFolder,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await this.cloudinary.uploader.upload(dataUri, {
      folder: `${CLOUDINARY_ROOT_FOLDER}/${folder}`,
      resource_type: 'image',
    });

    return { url: result.secure_url, publicId: result.public_id };
  }

  async deleteImage(publicId: string): Promise<{ message: string }> {
    await this.cloudinary.uploader.destroy(publicId);

    return { message: 'Image deleted successfully' };
  }
}
