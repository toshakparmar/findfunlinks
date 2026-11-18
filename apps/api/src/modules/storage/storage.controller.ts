import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService, UploadResult } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image or document (Authenticated)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<{ success: boolean; data: UploadResult }> {
    if (!file) {
      throw new BadRequestException(
        'A valid file payload must be provided under the "file" field.',
      );
    }
    const result = await this.storageService.uploadFile(file, folder || 'uploads');
    return {
      success: true,
      data: result,
    };
  }

  @Post('upload-public')
  @ApiOperation({ summary: 'Upload public registration image (Logos / Icons only, max 5MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadPublicFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: UploadResult }> {
    if (!file) {
      throw new BadRequestException(
        'A valid file payload must be provided under the "file" field.',
      );
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, WebP, and SVG images are permitted for public logo uploads.',
      );
    }
    const result = await this.storageService.uploadFile(file, 'registration-logos');
    return {
      success: true,
      data: result,
    };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file from Supabase storage by relative path' })
  async deleteFile(@Body('path') path: string): Promise<{ success: boolean }> {
    if (!path) {
      throw new BadRequestException('Storage path must be provided.');
    }
    const deleted = await this.storageService.deleteFile(path);
    return { success: deleted };
  }
}
