import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Axis } from '@prisma/client';

export class CreateProductPartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  geometryName: string;

  @IsEnum(Axis)
  axis: Axis;

  @IsNumber()
  @IsOptional()
  minScale?: number;

  @IsNumber()
  @IsOptional()
  maxScale?: number;

  @IsNumber()
  @IsOptional()
  priceFactor?: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;
}
