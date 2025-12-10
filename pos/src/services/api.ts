import axios from 'axios';
import type { Product, CashRegister } from '../types';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productService = {
  getAll: () => api.get<Product[]>('/products/for-pos/available'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
};

export const categoriesService = {
  getAll: () => api.get('/categories'),
};

export const salesService = {
  create: (data: any) => api.post('/sales', data),
  getAll: () => api.get('/sales'),
  getById: (id: string) => api.get(`/sales/${id}`),
  cancel: (id: string) => api.post(`/sales/${id}/cancel`, {}),
};

export const inventoryService = {
  getProductStock: (productId: string | number) =>
    api.get(`/inventory/stock/product/${productId}`),
};

export const cashRegisterService = {
  getAll: () => api.get<CashRegister[]>('/cash-registers'),
  getById: (id: string) => api.get<CashRegister>(`/cash-registers/${id}`),
  openSession: (cashRegisterId: string, openingCash: number) =>
    api.post('/cash-registers/sessions/open', {
      cashRegisterId,
      openingCash,
    }),
  closeSession: (sessionId: string, closingCash: number) =>
    api.post(`/cash-registers/sessions/${sessionId}/close`, { closingCash }),
  getActiveSessions: () => api.get('/cash-registers/sessions/my-active'),
};

export const branchesService = {
  getById: (id: number) => api.get(`/branches/${id}`),
};

export default api;
