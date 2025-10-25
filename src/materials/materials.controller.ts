import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { Prisma } from '@prisma/client';

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new material' })
  @ApiResponse({ status: 201, description: 'Material created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ description: 'Material data' })
  create(@Body() createMaterialDto: Prisma.MaterialCreateInput) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  @ApiResponse({
    status: 200,
    description: 'List of materials retrieved successfully',
  })
  findAll() {
    return this.materialsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material by ID' })
  @ApiParam({ name: 'id', description: 'Material ID' })
  @ApiResponse({ status: 200, description: 'Material retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material by ID' })
  @ApiParam({ name: 'id', description: 'Material ID' })
  @ApiBody({ description: 'Updated material data' })
  @ApiResponse({ status: 200, description: 'Material updated successfully' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: Prisma.MaterialUpdateInput,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material by ID' })
  @ApiParam({ name: 'id', description: 'Material ID' })
  @ApiResponse({ status: 200, description: 'Material deleted successfully' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
