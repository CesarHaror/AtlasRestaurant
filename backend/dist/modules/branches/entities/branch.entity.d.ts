import { Company } from '../../companies/entities/company.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
export declare class Branch {
    id: number;
    company: Company;
    name: string;
    address?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
    inventory?: Inventory[];
}
