import { Global, Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { PermissionsGuard } from './guards/permissions.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RbacService, PermissionsGuard],
  controllers: [RbacController],
  exports: [RbacService, PermissionsGuard],
})
export class RbacModule {}
