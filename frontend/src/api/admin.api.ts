import axios from 'axios';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  Branch,
  CreateBranchDto,
  UpdateBranchDto,
} from '../types/admin.types';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atlas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Users API
export const usersApi = {
  getAll: (page?: number, limit?: number, search?: string) =>
    api.get<{ data: User[]; total: number; page: number; limit: number }>('/users', {
      params: { page, limit, search },
    }),
  getById: (id: string) =>
    api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) =>
    api.post<User>('/users', data),
  update: (id: string, data: UpdateUserDto) =>
    api.patch<User>(`/users/${id}`, data),
  updatePassword: (id: string, currentPassword: string, newPassword: string) =>
    api.patch(`/users/${id}/password`, { currentPassword, newPassword }),
  toggleActive: (id: string) =>
    api.patch<User>(`/users/${id}/toggle-active`, {}),
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// Companies API
export const companiesApi = {
  getAll: () =>
    api.get<Company[]>('/companies'),
  getById: (id: number) =>
    api.get<Company>(`/companies/${id}`),
  create: (data: CreateCompanyDto) =>
    api.post<Company>('/companies', data),
  update: (id: number, data: UpdateCompanyDto) =>
    api.patch<Company>(`/companies/${id}`, data),
  delete: (id: number) =>
    api.delete(`/companies/${id}`),
};

// Branches API
export const branchesApi = {
  getAll: () =>
    api.get<Branch[]>('/branches'),
  getById: (id: number) =>
    api.get<Branch>(`/branches/${id}`),
  create: (data: CreateBranchDto) =>
    api.post<Branch>('/branches', data),
  update: (id: number, data: UpdateBranchDto) =>
    api.patch<Branch>(`/branches/${id}`, data),
  delete: (id: number) =>
    api.delete(`/branches/${id}`),
};
