import { Company } from '../../companies/entities/company.entity';
export declare class Product {
    id: number;
    company?: Company;
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    price?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
