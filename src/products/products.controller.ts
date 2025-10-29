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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { ProductStatus } from '@prisma/client';
import type { AuthenticatedRequest } from '../rbac/types/guard.types';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('products:create')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
  })
  findAll(@Query('status') status?: ProductStatus) {
    return this.productsService.findAll(status);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published products' })
  @ApiResponse({
    status: 200,
    description: 'List of published products',
  })
  findPublished() {
    return this.productsService.findPublished();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({
    status: 200,
    description: 'List of products in category',
  })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  search(@Query('q') query: string) {
    return this.productsService.searchProducts(query);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
  })
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Patch(':id')
  @RequirePermissions('products:update')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/status')
  @RequirePermissions('products:update')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Update product status' })
  updateStatus(@Param('id') id: string, @Body('status') status: ProductStatus) {
    return this.productsService.updateStatus(id, status);
  }

  @Patch(':id/view')
  @ApiOperation({ summary: 'Increment product view count' })
  incrementViewCount(@Param('id') id: string) {
    return this.productsService.incrementViewCount(id);
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 200,
    description: 'Product successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
