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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import {
  UpdateQuoteDto,
  ApproveQuoteDto,
  RejectQuoteDto,
} from './dto/update-quote.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { QuoteStatus } from '@prisma/client';
import type { AuthenticatedRequest } from '../rbac/types/guard.types';

@Controller('quotes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @RequirePermissions('quotes:create')
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.quotesService.create(createQuoteDto, req.user.id);
  }

  @Get()
  @RequirePermissions('quotes:read')
  findAll(
    @Query('status') status?: QuoteStatus,
    @Query('userId') userId?: string,
  ) {
    return this.quotesService.findAll(status, userId);
  }

  @Get('stats')
  @RequirePermissions('quotes:read')
  getQuoteStats() {
    return this.quotesService.getQuoteStats();
  }

  @Get('my-quotes')
  findMyQuotes(
    @Request() req: AuthenticatedRequest,
    @Query('status') status?: QuoteStatus,
  ) {
    return this.quotesService.findAll(status, req.user.id);
  }

  @Get('quote-number/:quoteNumber')
  findByQuoteNumber(@Param('quoteNumber') quoteNumber: string) {
    return this.quotesService.findByQuoteNumber(quoteNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Post('calculate-price')
  calculatePrice(
    @Body()
    data: {
      productId: string;
      materialId: string;
      width: number;
      height: number;
      depth: number;
      quantity?: number;
    },
  ) {
    return this.quotesService.calculatePrice(
      data.productId,
      data.materialId,
      data.width,
      data.height,
      data.depth,
      data.quantity,
    );
  }

  @Patch(':id')
  @RequirePermissions('quotes:update')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Patch(':id/approve')
  @RequirePermissions('quotes:approve')
  approve(
    @Param('id') id: string,
    @Body() approveQuoteDto: ApproveQuoteDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.quotesService.approve(id, approveQuoteDto, req.user.id);
  }

  @Patch(':id/reject')
  @RequirePermissions('quotes:approve')
  reject(@Param('id') id: string, @Body() rejectQuoteDto: RejectQuoteDto) {
    return this.quotesService.reject(id, rejectQuoteDto);
  }

  @Delete(':id')
  @RequirePermissions('quotes:delete')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }
}
