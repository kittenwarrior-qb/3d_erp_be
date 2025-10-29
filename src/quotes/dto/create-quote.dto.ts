import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { QuoteStatus } from '@prisma/client';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsNumber()
  @Min(0.1)
  customWidth: number;

  @IsNumber()
  @Min(0.1)
  customHeight: number;

  @IsNumber()
  @Min(0.1)
  customDepth: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number = 1;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsEnum(QuoteStatus)
  @IsOptional()
  status?: QuoteStatus = QuoteStatus.DRAFT;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;
}
