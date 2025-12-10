import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreateRoleDto, UpdateRoleDto, PermissionQueryDto } from './dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Get all permissions, optionally filtered by module
   */
  @Get('list')
  @ApiOperation({ summary: 'List all permissions' })
  async list(@Query() query: PermissionQueryDto) {
    return this.permissionsService.findAllPermissions(query);
  }

  /**
   * Get all roles
   */
  @Get('roles')
  @ApiOperation({ summary: 'List all roles' })
  @RequirePermissions('permissions', 'view')
  async getRoles() {
    return this.permissionsService.findAllRoles();
  }

  /**
   * Get specific role
   */
  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  @RequirePermissions('permissions', 'view')
  async getRoleById(@Param('id') id: string) {
    return this.permissionsService.findRoleById(id);
  }

  /**
   * Create new role
   */
  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new role' })
  @RequirePermissions('permissions', 'create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.permissionsService.createRole(createRoleDto);
  }

  /**
   * Update role
   */
  @Patch('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @RequirePermissions('permissions', 'edit')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.permissionsService.updateRole(id, updateRoleDto);
  }

  /**
   * Toggle role status
   */
  @Patch('roles/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle role active status' })
  @RequirePermissions('permissions', 'edit')
  async toggleRoleStatus(@Param('id') id: string) {
    return this.permissionsService.toggleRoleStatus(id);
  }

  /**
   * Delete role
   */
  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete role' })
  @RequirePermissions('permissions', 'delete')
  async deleteRole(@Param('id') id: string) {
    await this.permissionsService.removeRole(id);
  }

  /**
   * Soft delete role
   */
  @Delete('roles/:id/soft')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete role' })
  @RequirePermissions('permissions', 'delete')
  async softDeleteRole(@Param('id') id: string) {
    await this.permissionsService.softDeleteRole(id);
  }
}
