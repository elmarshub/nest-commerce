import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@generated/prisma/enums';
import { UploadsService } from './uploads.service';
import { UploadFolder, imageUploadOptions } from './uploads.constants';
import { UploadResponseDto } from './dto/upload-response.dto';
import { DeleteUploadDto } from './dto/delete-upload.dto';

const imageUploadBody = {
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary' },
    },
  },
};

@ApiTags('Uploads')
@ApiBearerAuth('JWT-auth')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageUploadBody)
  @ApiOperation({ summary: 'Upload the current user avatar image' })
  @ApiResponse({
    status: 201,
    description: 'The uploaded image URL and public ID',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No file or invalid image type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadImage(file, UploadFolder.AVATARS);
  }

  @Post('product-image')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageUploadBody)
  @ApiOperation({ summary: 'Upload a product image (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The uploaded image URL and public ID',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No file or invalid image type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadImage(file, UploadFolder.PRODUCTS);
  }

  @Post('category-image')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageUploadBody)
  @ApiOperation({ summary: 'Upload a category image (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The uploaded image URL and public ID',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'No file or invalid image type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async uploadCategoryImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadImage(file, UploadFolder.CATEGORIES);
  }

  @Delete()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an uploaded image (admin only)' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteImage(
    @Body() { publicId }: DeleteUploadDto,
  ): Promise<{ message: string }> {
    return this.uploadsService.deleteImage(publicId);
  }
}
