import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private repo: Repository<Supplier>) {}

  async create(dto: CreateSupplierDto) {
    const supplier = this.repo.create({
      ...dto,
      creditLimit: String(dto.creditLimit ?? 0),
      currentDebt: '0',
      active: dto.active ?? true,
    });
    return this.repo.save(supplier);
  }

  async findAll(q?: string, limit = 20) {
    const qb = this.repo.createQueryBuilder('s');
    if (q) {
      qb.where('LOWER(s.trade_name) LIKE :q OR LOWER(s.business_name) LIKE :q', { q: `%${q.toLowerCase()}%` });
    }
    qb.orderBy('s.id', 'DESC').take(limit);
    return qb.getMany();
  }

  async findOne(id: number) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async updateDebt(supplierId: number, amountDelta: number) {
    const supplier = await this.findOne(supplierId);
    const current = Number(supplier.currentDebt);
    supplier.currentDebt = String(current + amountDelta);
    await this.repo.save(supplier);
    return supplier;
  }

  async update(id: number, dto: CreateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, {
      ...dto,
      creditLimit: String(dto.creditLimit ?? supplier.creditLimit),
    });
    return this.repo.save(supplier);
  }
}