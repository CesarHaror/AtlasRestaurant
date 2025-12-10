export interface Permission {
  id: string;
  module: string;
  action: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionGroup {
  [key: string]: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  isSystem?: boolean;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isSystem?: boolean;
  permissionIds?: string[];
}

export interface PermissionQueryDto {
  module?: string;
}

export interface PermissionsResponse {
  grouped: PermissionGroup;
  flat: Permission[];
}
