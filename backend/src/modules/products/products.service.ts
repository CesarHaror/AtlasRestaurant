import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Product } from './entities/product.entity';
import { DeepPartial } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
  ) {}

  async create(dto: CreateProductDto, companyId: number): Promise<Product> {
    const toStr = (v: any) =>
      typeof v !== 'undefined' && v !== null ? String(v) : undefined;
    
    // Check for duplicate SKU
    if (dto.sku) {
      const existing = await this.repo.findOne({ where: { sku: dto.sku } });
      if (existing) {
        throw new ConflictException(`El SKU '${dto.sku}' ya existe`);
      }
    }
    
    const createData: DeepPartial<Product> = {
      ...dto,
      companyId,
      price: toStr(dto.price),
      standardCost: toStr(dto.standardCost),
      minStockAlert: toStr(dto.minStockAlert),
      maxStock: toStr(dto.maxStock),
      minTemperature: toStr(dto.minTemperature),
      maxTemperature: toStr(dto.maxTemperature),
    } as DeepPartial<Product>;
    const p = this.repo.create(createData);
    const saved = (await this.repo.save(p)) as unknown as Product;
    return saved;
  }

  async findAll(
    page = 1,
    limit = 50,
    companyId?: number,
    filters?: { search?: string; categoryId?: number; isActive?: boolean; showInPos?: boolean },
  ) {
    const qb = this.repo.createQueryBuilder('p');
    qb.where('p.company_id = :companyId', { companyId });
    if (filters?.search) {
      qb.andWhere(
        '(p.name ILIKE :q OR p.sku ILIKE :q OR p.barcode ILIKE :q)',
        { q: `%${filters.search}%` },
      );
    }
    if (typeof filters?.categoryId !== 'undefined') {
      qb.andWhere('p.category_id = :categoryId', { categoryId: filters.categoryId });
    }
    if (typeof filters?.isActive !== 'undefined') {
      qb.andWhere('p.is_active = :isActive', { isActive: filters.isActive });
    }
    if (typeof filters?.showInPos !== 'undefined') {
      qb.andWhere('p.show_in_pos = :showInPos', { showInPos: filters.showInPos });
    }
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Product> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const p = await this.findOne(id);
    
    // Check for duplicate SKU if updating
    if (dto.sku && dto.sku !== p.sku) {
      const existing = await this.repo.findOne({ where: { sku: dto.sku } });
      if (existing) {
        throw new ConflictException(`El SKU '${dto.sku}' ya existe`);
      }
    }
    
    const toStr = (v: any) =>
      typeof v !== 'undefined' && v !== null ? String(v) : undefined;
    if (typeof dto.price !== 'undefined') p.price = toStr(dto.price) as any;
    if (typeof dto.standardCost !== 'undefined')
      p.standardCost = toStr(dto.standardCost) as any;
    if (typeof dto.minStockAlert !== 'undefined')
      p.minStockAlert = toStr(dto.minStockAlert) as any;
    if (typeof dto.maxStock !== 'undefined')
      p.maxStock = toStr(dto.maxStock) as any;
    if (typeof dto.minTemperature !== 'undefined')
      p.minTemperature = toStr(dto.minTemperature) as any;
    if (typeof dto.maxTemperature !== 'undefined')
      p.maxTemperature = toStr(dto.maxTemperature) as any;
    
    // Explicitly handle image fields
    if (typeof dto.imageUrl !== 'undefined') p.imageUrl = dto.imageUrl;
    if (typeof dto.thumbnailUrl !== 'undefined') p.thumbnailUrl = dto.thumbnailUrl;
    
    Object.assign(p, dto);
    const saved = (await this.repo.save(p)) as unknown as Product;
    return saved;
  }

  async softDelete(id: number): Promise<void> {
    const p = await this.findOne(id);
    p.isActive = false;
    await this.repo.save(p);
  }

  async toggleActive(id: number): Promise<Product> {
    const p = await this.findOne(id);
    p.isActive = !p.isActive;
    const saved = (await this.repo.save(p)) as unknown as Product;
    return saved;
  }

  async togglePosVisibility(id: number): Promise<Product> {
    const p = await this.findOne(id);
    p.showInPos = !p.showInPos;
    const saved = (await this.repo.save(p)) as unknown as Product;
    return saved;
  }

  async restore(id: number): Promise<Product> {
    const p = await this.findOne(id);
    p.isActive = true;
    const saved = (await this.repo.save(p)) as unknown as Product;
    return saved;
  }

  async search(q: string, limit = 20) {
    return this.repo
      .createQueryBuilder('p')
      .where('p.name ILIKE :q OR p.sku ILIKE :q OR p.barcode ILIKE :q', {
        q: `%${q}%`,
      })
      .take(limit)
      .getMany();
  }

  async findBySku(sku: string) {
    return this.repo.findOne({ where: { sku } });
  }

  async findByBarcode(barcode: string) {
    return this.repo.findOne({ where: { barcode } });
  }

  async lowStock(reorderLevel = 10) {
    const rows = await this.inventoryRepo.find({
      where: { quantity: MoreThan(0) },
    });
    const low = rows.filter(
      (r) => r.quantity <= (r.reorderLevel ?? reorderLevel),
    );
    return low;
  }
}
