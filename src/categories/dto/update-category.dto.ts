import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    description: 'All fields from CreateCategoryDto are optional for updates',
    example: {
      name: 'Bàn Ghế Nội Thất',
      description: 'Danh mục sản phẩm nội thất trong nhà - đã cập nhật',
    },
  })
  example?: any;
}
