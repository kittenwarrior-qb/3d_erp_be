import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMaterialDto } from './create-material.dto';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @ApiProperty({
    description: 'All fields from CreateMaterialDto are optional for updates',
    example: {
      name: 'Gỗ Sồi Tự Nhiên - Cập nhật',
      unitPrice: 280000,
      isActive: false,
    },
  })
  example?: any;
}
