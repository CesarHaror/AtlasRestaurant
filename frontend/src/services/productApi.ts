import api from '../api/client';
import type { Product } from '../types/inventory';

const API_URL = '/products';

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await api.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  return response.data;
};
