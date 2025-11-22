import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private repo: Repository<Inventory>,
  ) {}

  async findAll() {
    return this.repo.find({ relations: ['product', 'branch'] });
  }

  async findByProduct(productId: number) {
    return this.repo.find({
      where: { product: { id: productId } },
      relations: ['branch'],
    });
  }

  async findOne(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['product', 'branch'],
    });
  }
}
