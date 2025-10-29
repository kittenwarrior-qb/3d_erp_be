import { Module } from '@nestjs/common';
import { ProductPartsService } from './product-parts.service';
import { ProductPartsController } from './product-parts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductPartsController],
  providers: [ProductPartsService],
  exports: [ProductPartsService],
})
export class ProductPartsModule {}
