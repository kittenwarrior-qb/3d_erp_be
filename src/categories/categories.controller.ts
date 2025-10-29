import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('jwt-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions('categories:create')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with optional filters' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by category name or description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: 'string',
    enum: ['name', 'createdAt', 'updatedAt', 'productCount'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: 'string',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories with pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      search,
      sortBy: sortBy || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    return this.categoriesService.findAllWithFilters(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID with products' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details with products',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/product-stats')
  @RequirePermissions('categories:read')
  @ApiOperation({ summary: 'Get product statistics for category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Product statistics by status',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'number',
      },
      example: {
        DRAFT: 5,
        PUBLISHED: 12,
        ARCHIVED: 2,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  getProductStats(@Param('id') id: string) {
    return this.categoriesService.getProductStats(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get category by name' })
  @ApiParam({
    name: 'name',
    description: 'Category name',
    example: 'Bàn Ghế Ngoài Trời',
  })
  @ApiResponse({
    status: 200,
    description: 'Category details',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findByName(@Param('name') name: string) {
    return this.categoriesService.findByName(name);
  }

  @Patch(':id')
  @RequirePermissions('categories:update')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Category successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @RequirePermissions('categories:delete')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Category successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - category has products',
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
