import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
export declare class ProductsService {
    private repo;
    private inventoryRepo;
    constructor(repo: Repository<Product>, inventoryRepo: Repository<Inventory>);
    create(dto: CreateProductDto): Promise<Product>;
    findAll(page?: number, limit?: number): Promise<{
        data: Product[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<Product>;
    update(id: number, dto: UpdateProductDto): Promise<Product>;
    softDelete(id: number): Promise<void>;
    toggleActive(id: number): Promise<Product>;
    restore(id: number): Promise<Product>;
    search(q: string, limit?: number): Promise<Product[]>;
    findBySku(sku: string): Promise<Product | null>;
    findByBarcode(barcode: string): Promise<Product | null>;
    lowStock(reorderLevel?: number): Promise<Inventory[]>;
}
