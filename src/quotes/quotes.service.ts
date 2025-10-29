import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto, ApproveQuoteDto, RejectQuoteDto } from './dto/update-quote.dto';
import { QuoteStatus } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto, userId: string) {
    // Generate unique quote number
    const quoteNumber = await this.generateQuoteNumber();

    return this.prisma.quote.create({
      data: {
        ...createQuoteDto,
        userId,
        quoteNumber,
        validUntil: createQuoteDto.validUntil ? new Date(createQuoteDto.validUntil) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            unitPrice: true,
          },
        },
      },
    });
  }

  async findAll(status?: QuoteStatus, userId?: string) {
    return this.prisma.quote.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
            defaultWidth: true,
            defaultHeight: true,
            defaultDepth: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            unitPrice: true,
            unit: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async findByQuoteNumber(quoteNumber: string) {
    return this.prisma.quote.findUnique({
      where: { quoteNumber },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto) {
    await this.findOne(id);

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...updateQuoteDto,
        validUntil: updateQuoteDto.validUntil ? new Date(updateQuoteDto.validUntil) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async approve(id: string, approveQuoteDto: ApproveQuoteDto, approvedBy: string) {
    const quote = await this.findOne(id);

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Only pending quotes can be approved');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy,
        notes: approveQuoteDto.notes || quote.notes,
      },
    });
  }

  async reject(id: string, rejectQuoteDto: RejectQuoteDto) {
    const quote = await this.findOne(id);

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Only pending quotes can be rejected');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: rejectQuoteDto.rejectionReason,
        notes: rejectQuoteDto.notes || quote.notes,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.quote.delete({
      where: { id },
    });
  }

  async calculatePrice(
    productId: string,
    materialId: string,
    width: number,
    height: number,
    depth: number,
    quantity: number = 1,
  ) {
    // Get product and material info
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { material: true },
    });

    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!product || !material) {
      throw new NotFoundException('Product or material not found');
    }

    // Basic calculation - this would be enhanced with Scala backend
    const volume = width * height * depth;
    const materialCost = volume * material.unitPrice;
    const baseCost = product.basePrice || 0;
    const unitPrice = baseCost + materialCost;
    const totalPrice = unitPrice * quantity;

    return {
      unitPrice,
      totalPrice,
      volume,
      materialCost,
      baseCost,
    };
  }

  async getQuoteStats() {
    const stats = await this.prisma.quote.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    return stats.reduce(
      (acc, stat) => {
        acc[stat.status] = {
          count: stat._count.status,
          totalValue: stat._sum.totalPrice || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; totalValue: number }>,
    );
  }

  private async generateQuoteNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `QT${year}${month}${day}`;

    // Find the last quote number for today
    const lastQuote = await this.prisma.quote.findFirst({
      where: {
        quoteNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        quoteNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastQuote) {
      const lastSequence = parseInt(lastQuote.quoteNumber.slice(-3));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
  }
}
