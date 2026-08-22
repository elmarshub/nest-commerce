import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

export enum UploadFolder {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  AVATARS = 'avatars',
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const imageUploadOptions: MulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException(
          'Only JPEG, PNG, WEBP or GIF images are allowed',
        ),
        false,
      );

      return;
    }

    callback(null, true);
  },
};
