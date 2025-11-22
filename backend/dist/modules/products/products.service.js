"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const inventory_entity_1 = require("../inventory/entities/inventory.entity");
let ProductsService = class ProductsService {
    repo;
    inventoryRepo;
    constructor(repo, inventoryRepo) {
        this.repo = repo;
        this.inventoryRepo = inventoryRepo;
    }
    async create(dto) {
        const createData = {
            ...dto,
            price: typeof dto.price !== 'undefined' ? String(dto.price) : undefined,
        };
        const p = this.repo.create(createData);
        const saved = (await this.repo.save(p));
        return saved;
    }
    async findAll(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.repo.findAndCount({ skip, take: limit });
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Product not found');
        return p;
    }
    async update(id, dto) {
        const p = await this.findOne(id);
        if (typeof dto.price !== 'undefined')
            p.price = String(dto.price);
        Object.assign(p, dto);
        const saved = (await this.repo.save(p));
        return saved;
    }
    async softDelete(id) {
        const p = await this.findOne(id);
        p.isActive = false;
        await this.repo.save(p);
    }
    async toggleActive(id) {
        const p = await this.findOne(id);
        p.isActive = !p.isActive;
        const saved = (await this.repo.save(p));
        return saved;
    }
    async restore(id) {
        const p = await this.findOne(id);
        p.isActive = true;
        const saved = (await this.repo.save(p));
        return saved;
    }
    async search(q, limit = 20) {
        return this.repo
            .createQueryBuilder('p')
            .where('p.name ILIKE :q OR p.sku ILIKE :q OR p.barcode ILIKE :q', {
            q: `%${q}%`,
        })
            .take(limit)
            .getMany();
    }
    async findBySku(sku) {
        return this.repo.findOne({ where: { sku } });
    }
    async findByBarcode(barcode) {
        return this.repo.findOne({ where: { barcode } });
    }
    async lowStock(reorderLevel = 10) {
        const rows = await this.inventoryRepo.find({
            where: { quantity: (0, typeorm_2.MoreThan)(0) },
        });
        const low = rows.filter((r) => r.quantity <= (r.reorderLevel ?? reorderLevel));
        return low;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map