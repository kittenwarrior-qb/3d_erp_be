import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Material } from '@prisma/client';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MaterialCreateInput): Promise<Material> {
    return await this.prisma.material.create({ data });
  }

  async findAll(): Promise<Material[]> {
    return await this.prisma.material.findMany();
  }

  async findOne(id: string): Promise<Material | null> {
    return await this.prisma.material.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Prisma.MaterialUpdateInput,
  ): Promise<Material> {
    return await this.prisma.material.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Material> {
    return await this.prisma.material.delete({ where: { id } });
  }
}
