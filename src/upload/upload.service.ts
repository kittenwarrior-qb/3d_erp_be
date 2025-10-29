import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: any,
    folder = 'materials',
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Validate file exists
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate file type
      const mimetype = (file as any).mimetype;
      if (!mimetype || !mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileSize = (file as any).size;
      if (fileSize && fileSize > maxSize) {
        throw new BadRequestException('File size must be less than 5MB');
      }

      // Upload to Cloudinary
      const result = await new Promise<CloudinaryResult>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `3d_erp/${folder}`,
              resource_type: 'image',
              transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' },
                { format: 'webp' },
              ],
            },
            (error, uploadResult) => {
              if (error) {
                reject(new Error(error.message || 'Upload failed'));
              } else if (uploadResult) {
                resolve({
                  secure_url: uploadResult.secure_url,
                  public_id: uploadResult.public_id,
                });
              } else {
                reject(new Error('Upload failed - no result'));
              }
            },
          )
          .end((file as any).buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to upload image: ${errorMessage}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to delete image: ${errorMessage}`);
    }
  }
}
