import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product SKU',
    example: 'CHAIR-001',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Bàn ghế ngoài trời',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Bộ bàn ghế ngoài trời chất lượng cao',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Model URL (.glb/.gltf)',
    example: 'https://example.com/model.glb',
  })
  @IsString()
  @IsNotEmpty()
  modelUrl: string;

  @ApiProperty({
    description: 'Category ID',
    example: 'clxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    required: false,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.DRAFT;

  @ApiProperty({
    description: 'Base price',
    example: 1500000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiProperty({
    description: 'Default width in meters',
    example: 1.8,
  })
  @IsNumber()
  defaultWidth: number;

  @ApiProperty({
    description: 'Default height in meters',
    example: 0.76,
  })
  @IsNumber()
  defaultHeight: number;

  @ApiProperty({
    description: 'Default depth in meters',
    example: 0.9,
  })
  @IsNumber()
  defaultDepth: number;

  @ApiProperty({
    description: 'Weight in kg',
    example: 25.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Product tags',
    example: ['outdoor', 'furniture', 'chair'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
