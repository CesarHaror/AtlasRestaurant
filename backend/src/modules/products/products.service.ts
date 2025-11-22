import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateProductDto): Promise<Product> {
    const createData: DeepPartial<Product> = {
      ...dto,
      price: typeof dto.price !== 'undefined' ? String(dto.price) : undefined,
    } as DeepPartial<Product>;
    const p = this.repo.create(createData);
    const saved = (await this.repo.save(p)) as unknown as Product;
    return saved;
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repo.findAndCount({ skip, take: limit });
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Product> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const p = await this.findOne(id);
    if (typeof dto.price !== 'undefined') p.price = String(dto.price as any);
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
