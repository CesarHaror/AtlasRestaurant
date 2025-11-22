import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private repo;
    constructor(repo: Repository<Company>);
    create(dto: CreateCompanyDto): Promise<Company>;
    findAll(): Promise<Company[]>;
    findOne(id: number): Promise<Company>;
    update(id: number, dto: UpdateCompanyDto): Promise<Company>;
    remove(id: number): Promise<void>;
}
