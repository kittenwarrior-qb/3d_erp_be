import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Role,
  Permission,
  RoleWithPermissions,
  PermissionWithCount,
} from './types/rbac.types';

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user?.role) {
      return [];
    }

    return user.role.rolePermissions.map((rp) => rp.permission.name);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  async getRolePermissions(roleName: string): Promise<string[]> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return [];
    }

    return role.rolePermissions.map((rp) => rp.permission.name);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const roleExists = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!roleExists) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roleId: roleId,
        },
      });
    } catch (error) {
      if (error === 'P2025') {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      throw error;
    }
  }
  async createRole(name: string, description?: string): Promise<Role> {
    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }

  async createPermission(
    name: string,
    description?: string,
  ): Promise<Permission> {
    return this.prisma.permission.create({
      data: {
        name,
        description,
      },
    });
  }

  async getAllRoles(): Promise<RoleWithPermissions[]> {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  async getAllPermissions(): Promise<PermissionWithCount[]> {
    return this.prisma.permission.findMany({
      include: {
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });
  }
}
