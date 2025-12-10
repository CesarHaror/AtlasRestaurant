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
} from '../types/product.types';

export const productsApi = {
  // Products CRUD
  async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const { data } = await client.get<ProductListResponse>(`/products?${params.toString()}`);
    return data;
  },

  async getProduct(id: number): Promise<Product> {
    const { data } = await client.get<Product>(`/products/${id}`);
    return data;
  },

  async getProductBySku(sku: string): Promise<Product> {
    const { data } = await client.get<Product>(`/products/sku/${sku}`);
    return data;
  },

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const { data } = await client.post<Product>('/products', dto);
    return data;
  },

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const { data } = await client.patch<Product>(`/products/${id}`, dto);
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await client.delete(`/products/${id}`);
  },

  // Categories
  async getCategories(): Promise<ProductCategory[]> {
    const { data } = await client.get<ProductCategory[]>('/categories');
    return data;
  },

  async getCategory(id: number): Promise<ProductCategory> {
    const { data } = await client.get<ProductCategory>(`/categories/${id}`);
    return data;
  },

  async createCategory(dto: CreateCategoryDto): Promise<ProductCategory> {
    const { data } = await client.post<ProductCategory>('/categories', dto);
    return data;
  },

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<ProductCategory> {
    const { data } = await client.patch<ProductCategory>(`/categories/${id}`, dto);
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
