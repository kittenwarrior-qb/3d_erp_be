import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {}

export class ApproveQuoteDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectQuoteDto {
  @IsString()
  rejectionReason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
