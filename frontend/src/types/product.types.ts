export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  category?: ProductCategory;
  unitOfMeasureId?: number;
  unitOfMeasure?: UnitOfMeasure;
  price: number;
  standardCost?: number;
  isVariableWeight: boolean;
  productType: string;
  trackInventory: boolean;
  trackLots: boolean;
  trackExpiry: boolean;
  minStockAlert?: number;
  maxStock?: number;
  requiresRefrigeration: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  primarySupplierId?: number;
  barcode?: string;
  satProductKey?: string;
  satUnitKey?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  showInPos: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  displayOrder?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface UnitOfMeasure {
  id: number;
  code: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  unitOfMeasureId?: number;
  price: number;
  standardCost?: number;
  isVariableWeight?: boolean;
  productType?: string;
  trackInventory?: boolean;
  trackLots?: boolean;
  trackExpiry?: boolean;
  minStockAlert?: number;
  maxStock?: number;
  requiresRefrigeration?: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  primarySupplierId?: number;
  barcode?: string;
  satProductKey?: string;
  satUnitKey?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  showInPos?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;
