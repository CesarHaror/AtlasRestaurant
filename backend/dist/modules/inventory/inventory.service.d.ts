import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
export declare class InventoryService {
    private repo;
    constructor(repo: Repository<Inventory>);
    findAll(): Promise<Inventory[]>;
    findByProduct(productId: number): Promise<Inventory[]>;
    findOne(id: number): Promise<Inventory | null>;
}
