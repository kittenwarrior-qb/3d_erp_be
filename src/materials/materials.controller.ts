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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { MaterialType } from '@prisma/client';

@ApiTags('Materials')
@Controller('materials')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('jwt-auth')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @RequirePermissions('materials:create')
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({
    status: 201,
    description: 'Material successfully created',
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
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials with optional filters' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by material name, code, or description',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: MaterialType,
    description: 'Filter by material type',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: 'string',
    description: 'Filter by active status (true/false)',
  })
  @ApiQuery({
    name: 'supplier',
    required: false,
    type: 'string',
    description: 'Filter by supplier name',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: 'number',
    description: 'Filter by minimum unit price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: 'number',
    description: 'Filter by maximum unit price',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: 'string',
    enum: ['name', 'code', 'unitPrice', 'createdAt', 'updatedAt'],
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
    description: 'List of materials with pagination',
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
    @Query('type') type?: MaterialType,
    @Query('isActive') isActive?: string,
    @Query('supplier') supplier?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      search,
      type,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      supplier,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sortBy || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    return this.materialsService.findAllWithFilters(filters);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all available material types' })
  @ApiResponse({
    status: 200,
    description: 'List of material types',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(MaterialType),
      },
    },
  })
  getMaterialTypes() {
    return this.materialsService.getMaterialTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Material details',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Get(':id/usage-stats')
  @RequirePermissions('materials:read')
  @ApiOperation({ summary: 'Get material usage statistics' })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Material usage statistics',
    schema: {
      type: 'object',
      properties: {
        productCount: { type: 'number' },
        quoteCount: { type: 'number' },
        totalValue: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  getUsageStats(@Param('id') id: string) {
    return this.materialsService.getUsageStats(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get material by code' })
  @ApiParam({
    name: 'code',
    description: 'Material code',
    example: 'WOOD_OAK_001',
  })
  @ApiResponse({
    status: 200,
    description: 'Material details',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  findByCode(@Param('code') code: string) {
    return this.materialsService.findByCode(code);
  }

  @Patch(':id')
  @RequirePermissions('materials:update')
  @ApiOperation({ summary: 'Update material' })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Material successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Patch(':id/activate')
  @RequirePermissions('materials:update')
  @ApiOperation({ summary: 'Activate material' })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Material successfully activated',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  activate(@Param('id') id: string) {
    return this.materialsService.activate(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('materials:update')
  @ApiOperation({ summary: 'Deactivate material' })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Material successfully deactivated',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  deactivate(@Param('id') id: string) {
    return this.materialsService.deactivate(id);
  }

  @Delete(':id')
  @RequirePermissions('materials:delete')
  @ApiOperation({ summary: 'Delete material (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'Material ID',
    example: 'clxxxxx',
  })
  @ApiResponse({
    status: 200,
    description: 'Material successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Material not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - material is being used',
  })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
