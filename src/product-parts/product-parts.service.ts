import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductPartDto } from './dto/create-product-part.dto';
import { UpdateProductPartDto } from './dto/update-product-part.dto';

@Injectable()
export class ProductPartsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductPartDto: CreateProductPartDto) {
    return this.prisma.productPart.create({
      data: createProductPartDto,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.productPart.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.productPart.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const productPart = await this.prisma.productPart.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    if (!productPart) {
      throw new NotFoundException(`Product part with ID ${id} not found`);
    }

    return productPart;
  }

  async update(id: string, updateProductPartDto: UpdateProductPartDto) {
    await this.findOne(id);

    return this.prisma.productPart.update({
      where: { id },
      data: updateProductPartDto,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.productPart.delete({
      where: { id },
    });
  }

  async findByGeometryName(productId: string, geometryName: string) {
    return this.prisma.productPart.findFirst({
      where: {
        productId,
        geometryName,
      },
    });
  }

  async getPartsByAxis(productId: string, axis: string) {
    return this.prisma.productPart.findMany({
      where: {
        productId,
        axis: axis as any,
      },
      orderBy: { name: 'asc' },
    });
  }
}
