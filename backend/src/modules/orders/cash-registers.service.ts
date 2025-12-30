import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashRegister } from './entities/cash-register.entity';

@Injectable()
export class CashRegistersService {
  constructor(@InjectRepository(CashRegister) private repo: Repository<CashRegister>) {}

  create(name: string) {
    return this.repo.save(this.repo.create({ name }));
  }

  findAll() {
    return this.repo.find();
  }
}
