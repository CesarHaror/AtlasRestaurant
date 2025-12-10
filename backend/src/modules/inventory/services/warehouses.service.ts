import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto/create-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    // Verificar que el código no exista
    const existingCode = await this.warehouseRepository.findOne({
      where: {
        code: createWarehouseDto.code,
        deletedAt: IsNull(),
      } as FindOptionsWhere<Warehouse>,
    });

    if (existingCode) {
      throw new ConflictException(
        `El código ${createWarehouseDto.code} ya existe`,
      );
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(branchId?: number): Promise<Warehouse[]> {
    const where: FindOptionsWhere<Warehouse> = {
      deletedAt: IsNull(),
    };

    if (branchId) {
      where.branchId = branchId;
    }

    return this.warehouseRepository.find({
      where,
      // relations: ['branch'], // TODO: Add when Branch migrates to UUID
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!warehouse) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    return warehouse;
  }

  async findByBranch(branchId: number): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      where: {
        branchId,
        isActive: true,
        deletedAt: IsNull(),
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    // Si se está actualizando el código, verificar que no exista
    if (
      updateWarehouseDto.code &&
      updateWarehouseDto.code !== warehouse.code
    ) {
      const existingCode = await this.warehouseRepository.findOne({
        where: {
          code: updateWarehouseDto.code,
          deletedAt: IsNull(),
        },
      });

      if (existingCode) {
        throw new ConflictException(
          `El código ${updateWarehouseDto.code} ya existe`,
        );
      }
    }

    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: number): Promise<void> {
    const warehouse = await this.findOne(id);

    // Verificar si tiene lotes activos
    // Esto se verificará cuando implementemos la relación completamente

    // Soft delete
    warehouse.deletedAt = new Date();
    await this.warehouseRepository.save(warehouse);
  }

  async toggleActive(id: number): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    warehouse.isActive = !warehouse.isActive;
    return this.warehouseRepository.save(warehouse);
  }
}
