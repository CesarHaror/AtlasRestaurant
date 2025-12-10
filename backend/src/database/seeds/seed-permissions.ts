import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, Role } from '../../modules/permissions/entities';
import { v4 as uuid } from 'uuid';

interface PermissionDef {
  module: string;
  action: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

interface RoleDef {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // Format: "module:action"
}

@Injectable()
export class SeedPermissionsService {
  private readonly permissionDefinitions: PermissionDef[] = [
    // Products
    { module: 'products', action: 'view', name: 'View Products', isSystem: true },
    { module: 'products', action: 'create', name: 'Create Product', isSystem: true },
    { module: 'products', action: 'edit', name: 'Edit Product', isSystem: true },
    { module: 'products', action: 'delete', name: 'Delete Product', isSystem: true },

    // Categories
    { module: 'categories', action: 'view', name: 'View Categories', isSystem: true },
    { module: 'categories', action: 'create', name: 'Create Category', isSystem: true },
    { module: 'categories', action: 'edit', name: 'Edit Category', isSystem: true },
    { module: 'categories', action: 'delete', name: 'Delete Category', isSystem: true },

    // Suppliers
    { module: 'suppliers', action: 'view', name: 'View Suppliers', isSystem: true },
    { module: 'suppliers', action: 'create', name: 'Create Supplier', isSystem: true },
    { module: 'suppliers', action: 'edit', name: 'Edit Supplier', isSystem: true },
    { module: 'suppliers', action: 'delete', name: 'Delete Supplier', isSystem: true },

    // Purchases
    { module: 'purchases', action: 'view', name: 'View Purchases', isSystem: true },
    { module: 'purchases', action: 'create', name: 'Create Purchase', isSystem: true },
    { module: 'purchases', action: 'edit', name: 'Edit Purchase', isSystem: true },
    { module: 'purchases', action: 'delete', name: 'Delete Purchase', isSystem: true },
    { module: 'purchases', action: 'approve', name: 'Approve Purchase', isSystem: true },

    // Inventory
    { module: 'inventory', action: 'view', name: 'View Inventory', isSystem: true },
    { module: 'inventory', action: 'adjust', name: 'Adjust Inventory', isSystem: true },
    { module: 'inventory', action: 'view_movements', name: 'View Inventory Movements', isSystem: true },
    { module: 'inventory', action: 'view_lots', name: 'View Lots', isSystem: true },

    // Sales
    { module: 'sales', action: 'view', name: 'View Sales', isSystem: true },
    { module: 'sales', action: 'create', name: 'Create Sale', isSystem: true },
    { module: 'sales', action: 'edit', name: 'Edit Sale', isSystem: true },
    { module: 'sales', action: 'delete', name: 'Delete Sale', isSystem: true },
    { module: 'sales', action: 'refund', name: 'Refund Sale', isSystem: true },

    // Cash Registers
    { module: 'cash_registers', action: 'view', name: 'View Cash Registers', isSystem: true },
    { module: 'cash_registers', action: 'open', name: 'Open Cash Register', isSystem: true },
    { module: 'cash_registers', action: 'close', name: 'Close Cash Register', isSystem: true },

    // Users
    { module: 'users', action: 'view', name: 'View Users', isSystem: true },
    { module: 'users', action: 'create', name: 'Create User', isSystem: true },
    { module: 'users', action: 'edit', name: 'Edit User', isSystem: true },
    { module: 'users', action: 'delete', name: 'Delete User', isSystem: true },

    // Companies
    { module: 'companies', action: 'view', name: 'View Companies', isSystem: true },
    { module: 'companies', action: 'create', name: 'Create Company', isSystem: true },
    { module: 'companies', action: 'edit', name: 'Edit Company', isSystem: true },
    { module: 'companies', action: 'delete', name: 'Delete Company', isSystem: true },

    // Branches
    { module: 'branches', action: 'view', name: 'View Branches', isSystem: true },
    { module: 'branches', action: 'create', name: 'Create Branch', isSystem: true },
    { module: 'branches', action: 'edit', name: 'Edit Branch', isSystem: true },
    { module: 'branches', action: 'delete', name: 'Delete Branch', isSystem: true },

    // Permissions
    { module: 'permissions', action: 'view', name: 'View Permissions', isSystem: true },
    { module: 'permissions', action: 'create', name: 'Create Role', isSystem: true },
    { module: 'permissions', action: 'edit', name: 'Edit Role', isSystem: true },
    { module: 'permissions', action: 'delete', name: 'Delete Role', isSystem: true },

    // Dashboard
    { module: 'dashboard', action: 'view', name: 'View Dashboard', isSystem: true },

    // Reports
    { module: 'reports', action: 'view', name: 'View Reports', isSystem: true },
    { module: 'reports', action: 'export', name: 'Export Reports', isSystem: true },
  ];

  private readonly roleDefinitions: RoleDef[] = [
    {
      name: 'Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: [
        'products:view', 'products:create', 'products:edit', 'products:delete',
        'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
        'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete',
        'purchases:view', 'purchases:create', 'purchases:edit', 'purchases:delete', 'purchases:approve',
        'inventory:view', 'inventory:adjust', 'inventory:view_movements', 'inventory:view_lots',
        'sales:view', 'sales:create', 'sales:edit', 'sales:delete', 'sales:refund',
        'cash_registers:view', 'cash_registers:open', 'cash_registers:close',
        'users:view', 'users:create', 'users:edit', 'users:delete',
        'companies:view', 'companies:create', 'companies:edit', 'companies:delete',
        'branches:view', 'branches:create', 'branches:edit', 'branches:delete',
        'permissions:view', 'permissions:create', 'permissions:edit', 'permissions:delete',
        'dashboard:view', 'reports:view', 'reports:export',
      ],
    },
    {
      name: 'Manager',
      description: 'Full operational access',
      isSystem: true,
      permissions: [
        'products:view', 'products:create', 'products:edit',
        'categories:view', 'categories:create', 'categories:edit',
        'suppliers:view', 'suppliers:create', 'suppliers:edit',
        'purchases:view', 'purchases:create', 'purchases:edit', 'purchases:approve',
        'inventory:view', 'inventory:adjust', 'inventory:view_movements', 'inventory:view_lots',
        'sales:view', 'sales:create', 'sales:edit', 'sales:refund',
        'cash_registers:view', 'cash_registers:open', 'cash_registers:close',
        'users:view',
        'branches:view',
        'dashboard:view', 'reports:view', 'reports:export',
      ],
    },
    {
      name: 'Cashier',
      description: 'Sales and cash register access',
      isSystem: true,
      permissions: [
        'products:view',
        'sales:view', 'sales:create',
        'cash_registers:view', 'cash_registers:open', 'cash_registers:close',
        'dashboard:view',
      ],
    },
    {
      name: 'Warehouse',
      description: 'Inventory and purchases management',
      isSystem: true,
      permissions: [
        'products:view',
        'suppliers:view',
        'purchases:view', 'purchases:create',
        'inventory:view', 'inventory:adjust', 'inventory:view_movements', 'inventory:view_lots',
        'dashboard:view',
      ],
    },
    {
      name: 'Viewer',
      description: 'Read-only access',
      isSystem: true,
      permissions: [
        'products:view',
        'categories:view',
        'suppliers:view',
        'purchases:view',
        'inventory:view',
        'sales:view',
        'cash_registers:view',
        'dashboard:view',
        'reports:view',
      ],
    },
  ];

  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async seed(): Promise<void> {
    try {
      console.log('🌱 Seeding permissions and roles...');

      // Clear existing data - truncate instead of delete
      await this.permissionRepository.query('TRUNCATE TABLE "permissions" CASCADE');
      await this.roleRepository.query('TRUNCATE TABLE "roles" CASCADE');

      // Create permissions
      const permissions: Permission[] = [];
      for (const permDef of this.permissionDefinitions) {
        const permission = this.permissionRepository.create({
          id: uuid(),
          module: permDef.module,
          action: permDef.action,
          name: permDef.name,
          description: permDef.description,
          isSystem: permDef.isSystem || false,
        });
        permissions.push(permission);
      }
      await this.permissionRepository.save(permissions);
      console.log(`✅ Created ${permissions.length} permissions`);

      // Create roles
      for (const roleDef of this.roleDefinitions) {
        const rolePermissions = permissions.filter((p) =>
          roleDef.permissions.includes(`${p.module}:${p.action}`),
        );

        const role = this.roleRepository.create({
          id: uuid(),
          name: roleDef.name,
          description: roleDef.description,
          isSystem: roleDef.isSystem,
          isActive: true,
          permissions: rolePermissions,
        });

        await this.roleRepository.save(role);
        console.log(`✅ Created role: ${role.name} with ${rolePermissions.length} permissions`);
      }

      console.log('✅ Seed completed successfully!');
    } catch (error) {
      console.error('❌ Seed failed:', error);
      throw error;
    }
  }
}
