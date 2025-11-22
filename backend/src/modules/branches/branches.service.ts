import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private repo: Repository<Branch>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const company = await this.companyRepo.findOne({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');
    const branch = this.repo.create({ ...dto, company });
    const saved = (await this.repo.save(branch)) as unknown as Branch;
    return saved;
  }

  async findAll(): Promise<Branch[]> {
    return this.repo.find({ relations: ['company'] });
  }

  async findOne(id: number): Promise<Branch> {
    const b = await this.repo.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!b) throw new NotFoundException('Branch not found');
    return b;
  }

  async update(id: number, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    if ((dto as unknown as CreateBranchDto).companyId) {
      const company = await this.companyRepo.findOne({
        where: { id: (dto as unknown as CreateBranchDto).companyId },
      });
      if (!company) throw new NotFoundException('Company not found');
      branch.company = company;
    }
    Object.assign(branch, dto);
    const saved = (await this.repo.save(branch)) as unknown as Branch;
    return saved;
  }

  async remove(id: number): Promise<void> {
    const b = await this.findOne(id);
    await this.repo.remove(b);
  }
}
