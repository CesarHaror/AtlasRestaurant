import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Company } from '../companies/entities/company.entity';
export declare class BranchesService {
    private repo;
    private companyRepo;
    constructor(repo: Repository<Branch>, companyRepo: Repository<Company>);
    create(dto: CreateBranchDto): Promise<Branch>;
    findAll(): Promise<Branch[]>;
    findOne(id: number): Promise<Branch>;
    update(id: number, dto: UpdateBranchDto): Promise<Branch>;
    remove(id: number): Promise<void>;
}
