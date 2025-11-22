import { Product } from '../../products/entities/product.entity';
import { Branch } from '../../branches/entities/branch.entity';
export declare class Inventory {
    id: number;
    product: Product;
    branch: Branch;
    quantity: number;
    reorderLevel: number;
    lastUpdated: Date;
}
