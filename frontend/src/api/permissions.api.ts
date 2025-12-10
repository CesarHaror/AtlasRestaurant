import axios from 'axios';
import {
  Permission,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  PermissionQueryDto,
  PermissionsResponse,
} from '../types/permissions.types';

const API_URL = `${import.meta.env.VITE_API_URL}/permissions`;

export const permissionsApi = {
  // Permissions
  async getPermissions(query?: PermissionQueryDto): Promise<PermissionsResponse> {
    const params = query ? { module: query.module } : {};
    const response = await axios.get<PermissionsResponse>(`${API_URL}/list`, {
      params,
    });
    return response.data;
  },

  // Roles
  async getRoles(): Promise<Role[]> {
    const response = await axios.get<Role[]>(`${API_URL}/roles`);
    return response.data;
  },

  async getRole(id: string): Promise<Role> {
    const response = await axios.get<Role>(`${API_URL}/roles/${id}`);
    return response.data;
  },

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const response = await axios.post<Role>(`${API_URL}/roles`, dto);
    return response.data;
  },

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const response = await axios.patch<Role>(`${API_URL}/roles/${id}`, dto);
    return response.data;
  },

  async toggleRoleStatus(id: string): Promise<Role> {
    const response = await axios.patch<Role>(`${API_URL}/roles/${id}/toggle-status`);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await axios.delete(`${API_URL}/roles/${id}`);
  },

  async softDeleteRole(id: string): Promise<void> {
    await axios.delete(`${API_URL}/roles/${id}/soft`);
  },
};
