import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '@prisma/client';

interface CategoryWhereInput {
  OR?: Array<{
    name?: {
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
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllWithFilters(filters: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    // Build where clause
    const where: CategoryWhereInput = {};

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
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Record<string, any> = {};
    if (sortBy === 'productCount') {
      // Special handling for product count sorting
      orderBy.products = {
        _count: sortOrder,
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Execute queries
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where: where as Prisma.CategoryWhereInput,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              status: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: orderBy as Prisma.CategoryOrderByWithRelationInput,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where: where as Prisma.CategoryWhereInput }),
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
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
            imageUrl: true,
            basePrice: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByName(name: string) {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has products
    if (category._count.products > 0) {
      throw new Error(
        `Cannot delete category "${category.name}" because it has ${category._count.products} products`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async getProductStats(id: string) {
    await this.findOne(id);

    const stats = await this.prisma.product.groupBy({
      by: ['status'],
      where: {
        categoryId: id,
        deletedAt: null,
      },
      _count: {
        status: true,
      },
    });

    return stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
