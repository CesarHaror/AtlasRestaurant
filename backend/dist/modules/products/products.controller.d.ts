import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly svc;
    constructor(svc: ProductsService);
    create(dto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(page?: string, limit?: string): Promise<{
        data: import("./entities/product.entity").Product[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    search(q: string): Promise<import("./entities/product.entity").Product[]>;
    lowStock(rl: string): Promise<import("../inventory/entities/inventory.entity").Inventory[]>;
    bySku(sku: string): Promise<import("./entities/product.entity").Product | null>;
    byBarcode(barcode: string): Promise<import("./entities/product.entity").Product | null>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    update(id: string, dto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
    toggle(id: string): Promise<import("./entities/product.entity").Product>;
    restore(id: string): Promise<import("./entities/product.entity").Product>;
}
