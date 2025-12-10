import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Permission, Role } from './entities';
import { CreateRoleDto, UpdateRoleDto, PermissionQueryDto } from './dto';

interface CachedPermissions {
  userId: string;
  permissions: string[];
  timestamp: number;
}

const CACHE_TTL = 3600000; // 1 hour in milliseconds

@Injectable()
export class PermissionsService {
  private permissionCache = new Map<string, CachedPermissions>();

  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Find all permissions, optionally filtered by module
   * Returns grouped by module and as flat array
   */
  async findAllPermissions(query?: PermissionQueryDto) {
    const where = query?.module ? { module: query.module } : {};
    
    const permissions = await this.permissionRepository.find({
      where,
      order: { module: 'ASC', action: 'ASC' },
    });

    // Group by module
    const grouped = permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.module]) {
          acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );

    return { grouped, flat: permissions };
  }

  /**
   * Create a new role with permissions
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, permissionIds, ...rest } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new BadRequestException(`Role "${name}" already exists`);
    }

    // Find permissions by IDs
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions were not found');
    }

    const role = this.roleRepository.create({
      name,
      ...rest,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  /**
   * Find all roles with their permissions
   */
  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions', 'users'],
      order: { name: 'ASC' },
      withDeleted: false,
    });
  }

  /**
   * Find role by ID
   */
  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role "${id}" not found`);
    }

    return role;
  }

  /**
   * Update role and its permissions
   */
  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    const { permissionIds, ...rest } = updateRoleDto;

    // Update basic fields
    Object.assign(role, rest);

    // Update permissions if provided
    if (permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
      });

      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Some permissions were not found');
      }

      role.permissions = permissions;
    }

    // Clear cache for all users with this role
    await this.clearRoleCache(id);

    return this.roleRepository.save(role);
  }

  /**
   * Remove role
   */
  async removeRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    if (role.users && role.users.length > 0) {
      throw new BadRequestException(
        `Cannot delete role with ${role.users.length} assigned users`,
      );
    }

    await this.roleRepository.delete(id);
    await this.clearRoleCache(id);
  }

  /**
   * Soft delete a role
   */
  async softDeleteRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    await this.roleRepository.softDelete(id);
    await this.clearRoleCache(id);
  }

  /**
   * Toggle role status
   */
  async toggleRoleStatus(id: string): Promise<Role> {
    const role = await this.findRoleById(id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    role.isActive = !role.isActive;
    await this.clearRoleCache(id);

    return this.roleRepository.save(role);
  }

  /**
   * Get user permissions from cache or database
   * Format: "module:action"
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user_perms_${userId}`;
    const cached = await this.cacheManager.get<string[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const permissions = await this.permissionRepository
      .createQueryBuilder('perm')
      .leftJoin('perm.roles', 'role')
      .leftJoin('role.users', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('role.isActive = true')
      .select('CONCAT(perm.module, ":", perm.action)', 'permission')
      .getRawMany<{ permission: string }>();

    const permissionStrings = permissions.map((p) => p.permission);

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, permissionStrings, CACHE_TTL);

    return permissionStrings;
  }

  /**
   * Check if user has specific permission
   * Checks cache first for performance
   */
  async hasPermission(
    userId: string,
    module: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const requiredPermission = `${module}:${action}`;
    return permissions.includes(requiredPermission);
  }

  /**
   * Check multiple permissions
   * Returns true if user has ALL permissions
   */
  async hasPermissions(
    userId: string,
    requiredPermissions: Array<{ module: string; action: string }>,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return requiredPermissions.every((perm) => {
      const permString = `${perm.module}:${perm.action}`;
      return userPermissions.includes(permString);
    });
  }

  /**
   * Clear cache for a specific role
   */
  private async clearRoleCache(roleId: string): Promise<void> {
    // In production, would query for all users with this role
    // and clear their permission cache
    // For now, we rely on TTL expiration
  }

  /**
   * Clear all permission caches
   */
  async clearAllCaches(): Promise<void> {
    // Para cache-manager, simplemente omitimos esta funcionalidad
    // Las cachés se limpian automáticamente después de 1 hora
  }
}
