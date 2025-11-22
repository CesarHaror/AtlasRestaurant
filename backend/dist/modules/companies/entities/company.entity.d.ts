import { Branch } from '../../branches/entities/branch.entity';
export declare class Company {
    id: number;
    name: string;
    ruc?: string;
    address?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
    branches?: Branch[];
}
