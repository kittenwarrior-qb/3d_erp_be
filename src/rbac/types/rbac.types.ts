export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithPermissions extends Role {
  rolePermissions: {
    permission: Permission;
  }[];
  _count: {
    users: number;
  };
}

export interface PermissionWithCount extends Permission {
  _count: {
    rolePermissions: number;
  };
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
}
