export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  categoryId?: number; // Añadido para filtrado por categoría en POS
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  thumbnailUrl?: string;
  imageUrl?: string;
}

export interface Sale {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface PaymentMethod {
  method: 'cash' | 'card' | 'transfer' | 'credit';
  amount: number;
}

export interface CashRegister {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  is_active?: boolean;
  branchId?: number;
  branch_id?: number;
  branch?: {
    id: number;
    name: string;
  };
  branchName?: string;
  deviceIdentifier?: string;
  device_identifier?: string;
  hasScale?: boolean;
  has_scale?: boolean;
  scalePort?: string;
  scale_port?: string;
}

export interface CashRegisterSession {
  id: string;
  cashRegisterId: string;
  openingAmount: number;
  closingAmount?: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt?: string;
}

export interface User {
  id: string | number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  branchId?: number;
  roles?: Array<{ id: number; name: string }> | string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}
