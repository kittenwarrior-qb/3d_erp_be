import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Bàn Ghế Ngoài Trời',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Danh mục sản phẩm nội thất ngoài trời cho sân vườn và ban công',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
