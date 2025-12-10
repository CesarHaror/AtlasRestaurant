// =====================================================
// MÓDULO: PERMISOS GRANULARES - BACKEND
// Sistema completo de gestión de permisos
// =====================================================

// ============= ENTITIES =============

// permissions/entities/permission.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  module: string; // 'products', 'sales', 'inventory'

  @Column({ length: 50 })
  action: string; // 'view', 'create', 'edit', 'delete', 'approve'

  @Column({ length: 100 })
  name: string; // 'Ver Productos', 'Crear Ventas'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean; // Permisos del sistema no editables

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// permissions/entities/role.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean; // Roles del sistema (Admin, Gerente) no editables

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

// ============= DTOs =============

// permissions/dto/create-role.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Cajero Senior' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Cajero con permisos de supervisor', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: 'IDs de permisos a asignar',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

// permissions/dto/update-role.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

// permissions/dto/permission-query.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  module?: string;
}

// ============= SERVICE =============

// permissions/permissions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // ========== PERMISOS ==========

  async findAllPermissions(module?: string): Promise<any> {
    const query = this.permissionRepository.createQueryBuilder('permission');

    if (module) {
      query.where('permission.module = :module', { module });
    }

    const permissions = await query.orderBy('permission.module', 'ASC').getMany();

    // Agrupar por módulo
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    return {
      permissions,
      grouped,
    };
  }

  // ========== ROLES ==========

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar que el nombre no exista
    const existing = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new BadRequestException(`El rol "${createRoleDto.name}" ya existe`);
    }

    // Obtener permisos
    const permissions = await this.permissionRepository.findByIds(
      createRoleDto.permissionIds,
    );

    if (permissions.length !== createRoleDto.permissionIds.length) {
      throw new BadRequestException('Algunos permisos no existen');
    }

    // Crear rol
    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOneRole(id);

    if (role.isSystem) {
      throw new BadRequestException('No se puede modificar un rol del sistema');
    }

    // Verificar nombre único si se está cambiando
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existing) {
        throw new BadRequestException(`El rol "${updateRoleDto.name}" ya existe`);
      }
    }

    // Actualizar permisos si se proporcionan
    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.findByIds(
        updateRoleDto.permissionIds,
      );

      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new BadRequestException('Algunos permisos no existen');
      }

      role.permissions = permissions;
    }

    // Actualizar otros campos
    if (updateRoleDto.name) {
      role.name = updateRoleDto.name;
    }

    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }

    return this.roleRepository.save(role);
  }

  async removeRole(id: string): Promise<void> {
    const role = await this.findOneRole(id);

    if (role.isSystem) {
      throw new BadRequestException('No se puede eliminar un rol del sistema');
    }

    if (role.users && role.users.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el rol porque tiene ${role.users.length} usuario(s) asignado(s)`,
      );
    }

    await this.roleRepository.softDelete(id);
  }

  async toggleRoleStatus(id: string): Promise<Role> {
    const role = await this.findOneRole(id);

    if (role.isSystem) {
      throw new BadRequestException('No se puede modificar un rol del sistema');
    }

    role.isActive = !role.isActive;
    return this.roleRepository.save(role);
  }

  // ========== UTILIDADES ==========

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoin('role.users', 'users')
      .where('users.id = :userId', { userId })
      .getOne();

    return user?.permissions || [];
  }

  async hasPermission(
    userId: string,
    module: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(
      (p) => p.module === module && p.action === action,
    );
  }
}

// ============= CONTROLLER =============

// permissions/permissions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionQueryDto } from './dto/permission-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Permisos y Roles')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // ========== PERMISOS ==========

  @Get('list')
  @ApiOperation({ summary: 'Listar todos los permisos disponibles' })
  @RequirePermissions('settings', 'view')
  async findAllPermissions(@Query() query: PermissionQueryDto) {
    return this.permissionsService.findAllPermissions(query.module);
  }

  // ========== ROLES ==========

  @Post('roles')
  @ApiOperation({ summary: 'Crear nuevo rol' })
  @RequirePermissions('settings', 'create')
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.permissionsService.createRole(createRoleDto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar todos los roles' })
  @RequirePermissions('settings', 'view')
  async findAllRoles() {
    return this.permissionsService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @RequirePermissions('settings', 'view')
  async findOneRole(@Param('id') id: string) {
    return this.permissionsService.findOneRole(id);
  }

  @Patch('roles/:id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @RequirePermissions('settings', 'edit')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.permissionsService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @RequirePermissions('settings', 'delete')
  async removeRole(@Param('id') id: string) {
    await this.permissionsService.removeRole(id);
    return { message: 'Rol eliminado exitosamente' };
  }

  @Patch('roles/:id/toggle-status')
  @ApiOperation({ summary: 'Activar/Desactivar un rol' })
  @RequirePermissions('settings', 'edit')
  async toggleRoleStatus(@Param('id') id: string) {
    return this.permissionsService.toggleRoleStatus(id);
  }
}

// ============= MODULE =============

// permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

// ============= GUARD PERSONALIZADO =============

// auth/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      { module: string; action: string }[]
    >('permissions', [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Verificar cada permiso requerido
    for (const { module, action } of requiredPermissions) {
      const hasPermission = await this.permissionsService.hasPermission(
        user.id,
        module,
        action,
      );

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}

// auth/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (module: string, action: string) =>
  SetMetadata('permissions', [{ module, action }]);

// ============= SEED DE PERMISOS =============

// database/seeds/permissions.seed.ts
export const PERMISSIONS_SEED = [
  // Dashboard
  { module: 'dashboard', action: 'view', name: 'Ver Dashboard' },

  // Productos
  { module: 'products', action: 'view', name: 'Ver Productos' },
  { module: 'products', action: 'create', name: 'Crear Productos' },
  { module: 'products', action: 'edit', name: 'Editar Productos' },
  { module: 'products', action: 'delete', name: 'Eliminar Productos' },

  // Proveedores
  { module: 'suppliers', action: 'view', name: 'Ver Proveedores' },
  { module: 'suppliers', action: 'create', name: 'Crear Proveedores' },
  { module: 'suppliers', action: 'edit', name: 'Editar Proveedores' },
  { module: 'suppliers', action: 'delete', name: 'Eliminar Proveedores' },

  // Compras
  { module: 'purchases', action: 'view', name: 'Ver Compras' },
  { module: 'purchases', action: 'create', name: 'Crear Compras' },
  { module: 'purchases', action: 'edit', name: 'Editar Compras' },
  { module: 'purchases', action: 'delete', name: 'Eliminar Compras' },
  { module: 'purchases', action: 'approve', name: 'Aprobar Compras' },
  { module: 'purchases', action: 'receive', name: 'Recibir Mercancía' },

  // Ventas
  { module: 'sales', action: 'view', name: 'Ver Ventas' },
  { module: 'sales', action: 'create', name: 'Crear Ventas' },
  { module: 'sales', action: 'cancel', name: 'Cancelar Ventas' },
  { module: 'sales', action: 'refund', name: 'Hacer Devoluciones' },

  // POS
  { module: 'pos', action: 'access', name: 'Acceder al POS' },
  { module: 'pos', action: 'open_session', name: 'Abrir Sesión de Caja' },
  { module: 'pos', action: 'close_session', name: 'Cerrar Sesión de Caja' },

  // Inventario
  { module: 'inventory', action: 'view', name: 'Ver Inventario' },
  { module: 'inventory', action: 'adjust', name: 'Ajustar Inventario' },
  { module: 'inventory', action: 'transfer', name: 'Crear Traslados' },
  { module: 'inventory', action: 'waste', name: 'Registrar Desperdicios' },

  // Reportes
  { module: 'reports', action: 'view', name: 'Ver Reportes' },
  { module: 'reports', action: 'sales', name: 'Reportes de Ventas' },
  { module: 'reports', action: 'inventory', name: 'Reportes de Inventario' },
  { module: 'reports', action: 'financial', name: 'Reportes Financieros' },
  { module: 'reports', action: 'export', name: 'Exportar Reportes' },

  // Usuarios
  { module: 'users', action: 'view', name: 'Ver Usuarios' },
  { module: 'users', action: 'create', name: 'Crear Usuarios' },
  { module: 'users', action: 'edit', name: 'Editar Usuarios' },
  { module: 'users', action: 'delete', name: 'Eliminar Usuarios' },

  // Configuración
  { module: 'settings', action: 'view', name: 'Ver Configuración' },
  { module: 'settings', action: 'edit', name: 'Editar Configuración' },
  { module: 'settings', action: 'create', name: 'Crear en Configuración' },
  { module: 'settings', action: 'delete', name: 'Eliminar en Configuración' },
];

// Script para insertar permisos
// npm run seed:permissions
import { DataSource } from 'typeorm';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { PERMISSIONS_SEED } from './permissions.seed';

async function seedPermissions() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Permission],
  });

  await dataSource.initialize();
  const permissionRepo = dataSource.getRepository(Permission);

  for (const perm of PERMISSIONS_SEED) {
    const exists = await permissionRepo.findOne({
      where: { module: perm.module, action: perm.action },
    });

    if (!exists) {
      await permissionRepo.save(permissionRepo.create(perm));
      console.log(`✅ Permiso creado: ${perm.name}`);
    }
  }

  await dataSource.destroy();
  console.log('✅ Seed de permisos completado');
}

seedPermissions();
