import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import type { CreateRoleDto, CreatePermissionDto } from './types/rbac.types';

@ApiTags('RBAC Management')
@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('jwt-auth')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @RequirePermissions('read:role')
  @ApiOperation({ summary: 'Get all roles with permissions' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('permissions')
  @RequirePermissions('read:role')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Post('roles')
  @RequirePermissions('create:role')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(
      createRoleDto.name,
      createRoleDto.description,
    );
  }

  @Post('permissions')
  @RequirePermissions('create:role')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(
      createPermissionDto.name,
      createPermissionDto.description,
    );
  }

  @Post('users/:userId/role/:roleId')
  @RequirePermissions('create:role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User or Role not found' })
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.rbacService.assignRoleToUser(userId, roleId);
    return { message: 'Role assigned successfully' };
  }

  @Get('roles/:roleName/permissions')
  @RequirePermissions('read:role')
  @ApiOperation({ summary: 'Get permissions for a specific role' })
  @ApiResponse({
    status: 200,
    description: 'Role permissions retrieved successfully',
  })
  async getRolePermissions(@Param('roleName') roleName: string) {
    const permissions = await this.rbacService.getRolePermissions(roleName);
    return { roleName, permissions };
  }
}
