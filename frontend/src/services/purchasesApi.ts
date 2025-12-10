import api from '../api/client';

// ============ TYPES ============

export interface Supplier {
  id: number;
  code: string;
  businessName: string;
  tradeName?: string;
  rfc?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  paymentTerms?: string;
  creditLimit: string | number;
  creditDays: number;
  rating: number;
  notes?: string;
  currentDebt: string | number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  quantityOrdered: string | number;
  quantityReceived: string | number;
  unitCost: string | number;
  taxRate: string | number;
  discountPercentage: string | number;
  lotNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface Purchase {
  id: number;
  purchaseNumber?: string;
  status: 'DRAFT' | 'SENT' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  branchId: number;
  warehouseId: number;
  supplierId: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  supplierInvoice?: string;
  paymentTerms?: string;
  dueDate?: string;
  notes?: string;
  subtotal: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  receivedDate?: Date;
  createdBy?: number;
  approvedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  items?: PurchaseItem[];
}

// ============ SUPPLIERS ============

export const getSuppliers = (params: { q?: string; limit?: number } = {}) => {
  const { q, limit = 20 } = params;
  const queryParams = new URLSearchParams();
  if (q) queryParams.append('q', q);
  if (limit) queryParams.append('limit', String(limit));
  return api.get(`/purchases/suppliers?${queryParams.toString()}`);
};

export const searchSuppliers = (q = '', limit = 10) => {
  const queryParams = new URLSearchParams();
  if (q) queryParams.append('q', q);
  if (limit) queryParams.append('limit', String(limit));
  return api.get(`/purchases/suppliers/search?${queryParams.toString()}`);
};

export const createSupplier = (data: any) => {
  return api.post('/purchases/suppliers', data);
};

export const updateSupplier = (id: number, data: any) => {
  return api.patch(`/purchases/suppliers/${id}`, data);
};

export const getSupplierPurchases = (supplierId: number, params: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 20 } = params;
  return api.get(`/purchases/supplier/${supplierId}?page=${page}&limit=${limit}`);
};

// ============ PURCHASES ============

export const getPurchases = (params: { page?: number; limit?: number; status?: string; supplierId?: number } = {}) => {
  const { page = 1, limit = 20, status, supplierId } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('limit', String(limit));
  if (status) queryParams.append('status', status);
  if (supplierId) queryParams.append('supplierId', String(supplierId));
  return api.get(`/purchases?${queryParams.toString()}`);
};

export const createPurchase = (data: any) => {
  return api.post('/purchases', data);
};

export const approvePurchase = (purchaseId: number) => {
  return api.post(`/purchases/${purchaseId}/approve`);
};

export const receivePurchase = (purchaseId: number, data: any) => {
  return api.post(`/purchases/${purchaseId}/receive`, data);
};
