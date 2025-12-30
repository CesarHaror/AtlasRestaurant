// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  branchId?: number;
  isActive: boolean;
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  branchId?: number;
  roleIds?: string[];
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  branchId?: number;
  roleIds?: string[];
}

// Company Types
export interface Restaurant {
  id: number;
  businessName: string;
  tradeName?: string;
  rfc?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  taxRegime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  businessName: string;
  tradeName?: string;
  rfc?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  taxRegime?: string;
}

export interface UpdateCompanyDto {
  businessName?: string;
  tradeName?: string;
  rfc?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  taxRegime?: string;
  isActive?: boolean;
}

// Branch Types
export interface Branch {
  id: number;
  companyId: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Restaurant;
}

export interface CreateBranchDto {
  companyId: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}
