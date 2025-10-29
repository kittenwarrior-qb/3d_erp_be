import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductPartsService } from './product-parts.service';
import { CreateProductPartDto } from './dto/create-product-part.dto';
import { UpdateProductPartDto } from './dto/update-product-part.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('product-parts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductPartsController {
  constructor(private readonly productPartsService: ProductPartsService) {}

  @Post()
  @RequirePermissions('products:update')
  create(@Body() createProductPartDto: CreateProductPartDto) {
    return this.productPartsService.create(createProductPartDto);
  }

  @Get()
  @RequirePermissions('products:read')
  findAll() {
    return this.productPartsService.findAll();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productPartsService.findByProduct(productId);
  }

  @Get('product/:productId/axis/:axis')
  getPartsByAxis(
    @Param('productId') productId: string,
    @Param('axis') axis: string,
  ) {
    return this.productPartsService.getPartsByAxis(productId, axis);
  }

  @Get('product/:productId/geometry/:geometryName')
  findByGeometryName(
    @Param('productId') productId: string,
    @Param('geometryName') geometryName: string,
  ) {
    return this.productPartsService.findByGeometryName(productId, geometryName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productPartsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('products:update')
  update(
    @Param('id') id: string,
    @Body() updateProductPartDto: UpdateProductPartDto,
  ) {
    return this.productPartsService.update(id, updateProductPartDto);
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  remove(@Param('id') id: string) {
    return this.productPartsService.remove(id);
  }
}
