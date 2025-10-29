import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, createdById: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        createdById,
      },
      include: {
        category: true,
        material: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        parts: true,
        variants: true,
      },
    });
  }

  async findAll(status?: ProductStatus) {
    return this.prisma.product.findMany({
      where: {
        ...(status && { status }),
        deletedAt: null,
      },
      include: {
        category: true,
        material: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            parts: true,
            variants: true,
            quotes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        category: true,
        material: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        parts: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        material: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        parts: true,
        variants: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ProductStatus.ARCHIVED,
      },
    });
  }

  async findPublished() {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        category: true,
        material: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        deletedAt: null,
      },
      include: {
        category: true,
        material: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySku(sku: string) {
    return this.prisma.product.findFirst({
      where: {
        sku,
        deletedAt: null,
      },
      include: {
        category: true,
        material: true,
      },
    });
  }

  async updateStatus(id: string, status: ProductStatus) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  async incrementViewCount(id: string) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async searchProducts(query: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            sku: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            tags: {
              has: query,
            },
          },
        ],
        deletedAt: null,
      },
      include: {
        category: true,
        material: true,
      },
      orderBy: { viewCount: 'desc' },
    });
  }
}
