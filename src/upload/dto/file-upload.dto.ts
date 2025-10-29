import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload (max 5MB)',
    example: 'image.jpg',
  })
  file: Express.Multer.File;
}

export class MultipleFileUploadDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Multiple image files to upload (max 10 files, 5MB each)',
    maxItems: 10,
  })
  files: Express.Multer.File[];
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Cloudinary URL',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/3d_erp/materials/sample.webp',
  })
  url: string;

  @ApiProperty({
    description: 'Cloudinary public ID for deletion',
    example: '3d_erp/materials/sample',
  })
  publicId: string;
}
