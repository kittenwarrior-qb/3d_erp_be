import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type {
  AuthenticatedRequest,
  PermissionRequirement,
} from '../types/guard.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<PermissionRequirement>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Handle different permission requirement types
    if (Array.isArray(requiredPermissions)) {
      const hasPermission = await this.rbacService.hasAnyPermission(
        user.id,
        requiredPermissions,
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.join(' OR ')}`,
        );
      }
    } else if ('any' in requiredPermissions) {
      const hasPermission = await this.rbacService.hasAnyPermission(
        user.id,
        requiredPermissions.any,
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.any.join(' OR ')}`,
        );
      }
    } else if ('all' in requiredPermissions) {
      // Require ALL of the permissions
      const hasPermission = await this.rbacService.hasAllPermissions(
        user.id,
        requiredPermissions.all,
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.all.join(' AND ')}`,
        );
      }
    }

    return true;
  }
}
