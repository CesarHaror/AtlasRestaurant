import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto) {
    const payload: Partial<Supplier> = {
      ...(dto as unknown as Partial<Supplier>),
      creditLimit: dto.creditLimit != null ? String(dto.creditLimit) : '0',
      currentBalance:
        dto.currentBalance != null ? String(dto.currentBalance) : '0',
    };
    const ent = this.repo.create(payload);
    return this.repo.save(ent);
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const take = Number(limit) || 20;
    const skip = (Number(page) - 1) * take;
    const where = search
      ? [
          { businessName: Like(`%${search}%`) },
          { tradeName: Like(`%${search}%`) },
          { code: Like(`%${search}%`) },
        ]
      : undefined;

    const [data, total] = await this.repo.findAndCount({
      where,
      take,
      skip,
      order: { businessName: 'ASC' },
    });

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, dto as Partial<Supplier>);
    if (dto.creditLimit != null) existing.creditLimit = String(dto.creditLimit);
    if (dto.currentBalance != null)
      existing.currentBalance = String(dto.currentBalance);
    return this.repo.save(existing);
  }

  async softDelete(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    existing.isActive = false;
    existing.deletedAt = new Date();
    return this.repo.save(existing);
  }

  async toggleActive(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    existing.isActive = !existing.isActive;
    return this.repo.save(existing);
  }

  async restore(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    existing.isActive = true;
    existing.deletedAt = undefined;
    return this.repo.save(existing);
  }
}
