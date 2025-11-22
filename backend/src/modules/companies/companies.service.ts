import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { DeepPartial } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private repo: Repository<Company>,
  ) {}

  async create(dto: CreateCompanyDto): Promise<Company> {
    const createData: DeepPartial<Company> = { ...dto } as DeepPartial<Company>;
    const company = this.repo.create(createData);
    const saved = (await this.repo.save(company)) as unknown as Company;
    return saved;
  }

  async findAll(): Promise<Company[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Company> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Company not found');
    return c;
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, dto);
    const saved = (await this.repo.save(company)) as unknown as Company;
    return saved;
  }

  async remove(id: number): Promise<void> {
    const company = await this.findOne(id);
    await this.repo.remove(company);
  }
}
