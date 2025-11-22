"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_entity_1 = require("./entities/branch.entity");
const company_entity_1 = require("../companies/entities/company.entity");
let BranchesService = class BranchesService {
    repo;
    companyRepo;
    constructor(repo, companyRepo) {
        this.repo = repo;
        this.companyRepo = companyRepo;
    }
    async create(dto) {
        const company = await this.companyRepo.findOne({
            where: { id: dto.companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const branch = this.repo.create({ ...dto, company });
        const saved = (await this.repo.save(branch));
        return saved;
    }
    async findAll() {
        return this.repo.find({ relations: ['company'] });
    }
    async findOne(id) {
        const b = await this.repo.findOne({
            where: { id },
            relations: ['company'],
        });
        if (!b)
            throw new common_1.NotFoundException('Branch not found');
        return b;
    }
    async update(id, dto) {
        const branch = await this.findOne(id);
        if (dto.companyId) {
            const company = await this.companyRepo.findOne({
                where: { id: dto.companyId },
            });
            if (!company)
                throw new common_1.NotFoundException('Company not found');
            branch.company = company;
        }
        Object.assign(branch, dto);
        const saved = (await this.repo.save(branch));
        return saved;
    }
    async remove(id) {
        const b = await this.findOne(id);
        await this.repo.remove(b);
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BranchesService);
//# sourceMappingURL=branches.service.js.map