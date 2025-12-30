import client from './client';
import type {
  Product,
  ProductCategory,
  UnitOfMeasure,
  ProductFilters,
  ProductListResponse,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types/menu.types';

export const menuApi = {
  // Products CRUD
  async getProducts(filters?: MenuItemFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const { data } = await client.get<ProductListResponse>(`/menu?${params.toString()}`);
    return data;
  },

  async getProduct(id: number): Promise<MenuItem> {
    const { data } = await client.get<MenuItem>(`/menu/${id}`);
    return data;
  },

  async getProductBySku(sku: string): Promise<MenuItem> {
    const { data } = await client.get<MenuItem>(`/menu/sku/${sku}`);
    return data;
  },

  async createProduct(dto: CreateProductDto): Promise<MenuItem> {
    const { data } = await client.post<MenuItem>('/menu', dto);
    return data;
  },

  async updateProduct(id: number, dto: UpdateProductDto): Promise<MenuItem> {
    const { data } = await client.patch<MenuItem>(`/menu/${id}`, dto);
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await client.delete(`/menu/${id}`);
  },

  // Categories
  async getCategories(): Promise<MenuCategory[]> {
    const { data } = await client.get<MenuCategory[]>('/categories');
    return data;
  },

  async getCategory(id: number): Promise<MenuCategory> {
    const { data } = await client.get<MenuCategory>(`/categories/${id}`);
    return data;
  },

  async createCategory(dto: CreateCategoryDto): Promise<MenuCategory> {
    const { data } = await client.post<MenuCategory>('/categories', dto);
    return data;
  },

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<MenuCategory> {
    const { data } = await client.patch<MenuCategory>(`/categories/${id}`, dto);
    return data;
  },

  async deleteCategory(id: number): Promise<void> {
    await client.delete(`/categories/${id}`);
  },

  // Units of Measure
  async getUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
    const { data } = await client.get<UnitOfMeasure[]>('/units-of-measure');
    return data;
  },
};
