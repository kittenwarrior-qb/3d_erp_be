import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPartDto } from './create-product-part.dto';

export class UpdateProductPartDto extends PartialType(CreateProductPartDto) {}
