import api from '../api/client';
import type { Product } from '../types/inventory';

const API_URL = '/menu';

export const getProducts = async (): Promise<MenuItem[]> => {
  const response = await api.get(API_URL);
  // El endpoint devuelve { data: [], total, page, totalPages }
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
};

export const getProduct = async (id: string): Promise<MenuItem> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const searchProducts = async (query: string): Promise<MenuItem[]> => {
  const response = await api.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  return response.data;
};
