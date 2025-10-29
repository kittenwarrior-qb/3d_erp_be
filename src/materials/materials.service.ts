import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialType, Prisma } from '@prisma/client';

interface MaterialWhereInput {
  deletedAt?: null;
  type?: MaterialType;
  isActive?: boolean;
  supplier?: {
    contains: string;
    mode: 'insensitive';
  };
  unitPrice?: {
    gte?: number;
    lte?: number;
  };
  OR?: Array<{
    name?: {
      contains: string;
      mode: 'insensitive';
    };
    code?: {
      contains: string;
      mode: 'insensitive';
    };
    description?: {
      contains: string;
      mode: 'insensitive';
    };
  }>;
}

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(createMaterialDto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: createMaterialDto,
    });
  }

  async findAll(type?: MaterialType, isActive?: boolean) {
    return this.prisma.material.findMany({
      where: {
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithFilters(filters: {
    search?: string;
    type?: MaterialType;
    isActive?: boolean;
    supplier?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      type,
      isActive,
      supplier,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build where clause
    const where: MaterialWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
      ...(supplier && {
        supplier: {
          contains: supplier,
          mode: 'insensitive',
        },
      }),
    };

    // Add search functionality
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Handle price range properly
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.unitPrice = {
        gte: minPrice,
        lte: maxPrice,
      };
    } else if (minPrice !== undefined) {
      where.unitPrice = {
        gte: minPrice,
      };
    } else if (maxPrice !== undefined) {
      where.unitPrice = {
        lte: maxPrice,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries
    const [data, total] = await Promise.all([
      this.prisma.material.findMany({
        where: where as Prisma.MaterialWhereInput,
        orderBy: orderBy as Prisma.MaterialOrderByWithRelationInput,
        skip,
        take: limit,
      }),
      this.prisma.material.count({ where: where as Prisma.MaterialWhereInput }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async findByCode(code: string) {
    return this.prisma.material.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto) {
    await this.findOne(id);

    return this.prisma.material.update({
      where: { id },
      data: updateMaterialDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.material.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.material.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.material.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  getMaterialTypes() {
    return Object.values(MaterialType);
  }

  async getUsageStats(id: string) {
    await this.findOne(id);

    const productCount = await this.prisma.product.count({
      where: {
        materialId: id,
        deletedAt: null,
      },
    });

    const quoteCount = await this.prisma.quote.count({
      where: {
        materialId: id,
      },
    });

    return {
      productCount,
      quoteCount,
    };
  }
}
