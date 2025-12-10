export class SupplierResponseDto {
  id: string;
  company?: string;
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
  creditLimit?: string;
  currentBalance?: string;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
