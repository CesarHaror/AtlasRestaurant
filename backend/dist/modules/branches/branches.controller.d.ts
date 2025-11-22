import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
export declare class BranchesController {
    private readonly svc;
    constructor(svc: BranchesService);
    create(dto: CreateBranchDto): Promise<import("./entities/branch.entity").Branch>;
    findAll(): Promise<import("./entities/branch.entity").Branch[]>;
    findOne(id: string): Promise<import("./entities/branch.entity").Branch>;
    update(id: string, dto: UpdateBranchDto): Promise<import("./entities/branch.entity").Branch>;
    remove(id: string): Promise<void>;
}
