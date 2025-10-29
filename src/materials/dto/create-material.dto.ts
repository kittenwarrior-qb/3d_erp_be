import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'Material name',
    example: 'Gỗ Sồi Tự Nhiên',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unique material code',
    example: 'WOOD_OAK_001',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Material type',
    enum: MaterialType,
    example: MaterialType.WOOD,
  })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty({
    description: 'Unit price per measurement unit',
    example: 250000,
    minimum: 0,
  })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({
    description: 'Measurement unit',
    example: 'm²',
    required: false,
    default: 'm²',
  })
  @IsString()
  @IsOptional()
  unit?: string = 'm²';

  @ApiProperty({
    description: 'URL to material texture image for Three.js rendering',
    example: 'https://example.com/textures/wood-oak.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  textureUrl?: string;

  @ApiProperty({
    description: 'Material color in hex format',
    example: '#8B4513',
    required: false,
  })
  @IsString()
  @IsOptional()
  colorHex?: string;

  @ApiProperty({
    description: 'Material density in kg/m³',
    example: 750,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  density?: number;

  @ApiProperty({
    description: 'Material description',
    example: 'Gỗ sồi tự nhiên chất lượng cao, phù hợp cho nội thất cao cấp',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Material supplier name',
    example: 'Công ty TNHH Gỗ Việt Nam',
    required: false,
  })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiProperty({
    description: 'Whether the material is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
