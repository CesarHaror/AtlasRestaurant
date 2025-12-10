import axios from 'axios';
import type { InventoryLot, InventoryMovement, CreateLotDto, CreateMovementDto } from '../types/inventory.types';

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

export const lotsApi = {
  getAll: (params?: { productId?: number; warehouseId?: number; status?: string; search?: string }) =>
    api.get<InventoryLot[]>('/inventory/lots', { params }),
  create: (data: CreateLotDto) => api.post<InventoryLot>('/inventory/lots', data),
  getByProduct: (productId: number, warehouseId?: number) =>
    api.get<InventoryLot[]>('/inventory/lots/product/' + productId, {
      params: warehouseId ? { warehouseId } : undefined,
    }),
  getByWarehouse: (warehouseId: number) =>
    api.get<InventoryLot[]>('/inventory/lots/warehouse/' + warehouseId),
  getById: (id: string) =>
    api.get<InventoryLot>('/inventory/lots/' + id),
};

export const movementsApi = {
  create: (data: CreateMovementDto) => api.post<InventoryMovement>('/inventory/movements', data),
  getAll: () => api.get<InventoryMovement[]>('/inventory/movements'),
  getByProduct: (productId: number) =>
    api.get<InventoryMovement[]>('/inventory/movements/product/' + productId),
};

export const transfersApi = {
  create: (data: any) => api.post('/inventory/transfers', data),
  getAll: (params?: { sourceWarehouseId?: number; destinationWarehouseId?: number; startDate?: Date; endDate?: Date }) =>
    api.get('/inventory/transfers', { params }),
  getByProduct: (productId: number) =>
    api.get('/inventory/transfers/product/' + productId),
};

// Warehouses API (minimal for lot creation)
export const warehousesApi = {
  getAll: (branchId?: number) =>
    api.get<Array<{ id: number; name: string; code: string; isActive: boolean }>>('/inventory/warehouses', {
      params: branchId ? { branchId } : undefined,
    }),
};
