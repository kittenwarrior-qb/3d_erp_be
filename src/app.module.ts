import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { PrismaModule } from './prisma/prisma.module';
import { MaterialsModule } from './materials/materials.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductPartsModule } from './product-parts/product-parts.module';
import { QuotesModule } from './quotes/quotes.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    MaterialsModule,
    CategoriesModule,
    ProductsModule,
    ProductPartsModule,
    QuotesModule,
    UploadModule,
    AuthModule,
    CommonModule,
    UsersModule,
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
