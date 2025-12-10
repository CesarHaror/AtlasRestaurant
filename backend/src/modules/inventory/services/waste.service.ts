import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, Between } from 'typeorm';
import { WasteRecord } from '../entities/waste-record.entity';
import { InventoryLot, LotStatus } from '../entities/inventory-lot.entity';
import { InventoryMovement, MovementType } from '../entities/inventory-movement.entity';
import { CreateWasteDto } from '../dto/create-waste.dto';

@Injectable()
export class WasteService {
  constructor(
    @InjectRepository(WasteRecord)
    private wasteRepository: Repository<WasteRecord>,
    @InjectRepository(InventoryLot)
    private lotRepository: Repository<InventoryLot>,
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  async create(createWasteDto: CreateWasteDto, userId: number): Promise<WasteRecord> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const totalCost = createWasteDto.unitCost * createWasteDto.quantity;

      // Crear registro de merma
      const waste = queryRunner.manager.create(WasteRecord, {
        ...createWasteDto,
        totalCost,
      });

      const savedWaste = await queryRunner.manager.save(waste);

      // Si hay lote específico, descontar del inventario
      if (createWasteDto.lotId) {
        const lot = await queryRunner.manager.findOne(InventoryLot, {
          where: { id: createWasteDto.lotId } as FindOptionsWhere<InventoryLot>,
          lock: { mode: 'pessimistic_write' },
        });

        if (!lot) {
          throw new NotFoundException(
            `Lote con ID ${createWasteDto.lotId} no encontrado`,
          );
        }

        if (Number(lot.currentQuantity) < createWasteDto.quantity) {
          throw new BadRequestException(
            `Cantidad insuficiente en lote. Disponible: ${lot.currentQuantity}`,
          );
        }

        lot.currentQuantity = Number(lot.currentQuantity) - createWasteDto.quantity;

        if (lot.currentQuantity <= 0) {
          lot.status = LotStatus.DAMAGED;
        }

        await queryRunner.manager.save(lot);
      }

      // Registrar movimiento de merma
      const movement = queryRunner.manager.create(InventoryMovement, {
        movementType: MovementType.WASTE,
        referenceType: 'WasteRecord',
        referenceId: savedWaste.id,
        productId: createWasteDto.productId,
        lotId: createWasteDto.lotId,
        warehouseId: createWasteDto.warehouseId,
        quantity: -createWasteDto.quantity, // Negativo para salida
        unitCost: createWasteDto.unitCost,
        totalCost,
        userId,
        notes: `Merma: ${createWasteDto.wasteType} - ${createWasteDto.reason}`,
      });

      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();

      return this.findOne(savedWaste.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    warehouseId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<WasteRecord[]> {
    const queryBuilder = this.wasteRepository
      .createQueryBuilder('waste')
      .leftJoinAndSelect('waste.warehouse', 'warehouse')
      .leftJoinAndSelect('waste.product', 'product')
      .leftJoinAndSelect('waste.lot', 'lot')
      .leftJoinAndSelect('waste.responsibleUser', 'user');

    if (warehouseId) {
      queryBuilder.andWhere('waste.warehouse_id = :warehouseId', { warehouseId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('waste.waste_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder
      .orderBy('waste.waste_date', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<WasteRecord> {
    const waste = await this.wasteRepository.findOne({
      where: { id },
      relations: ['warehouse', 'product', 'lot', 'responsibleUser'],
    });

    if (!waste) {
      throw new NotFoundException(`Registro de merma con ID ${id} no encontrado`);
    }

    return waste;
  }

  async getWasteStats(
    startDate: Date,
    endDate: Date,
    warehouseId?: number,
  ): Promise<{
    totalWaste: number;
    totalCost: number;
    byType: Array<{ type: string; quantity: number; cost: number }>;
    byProduct: Array<{ productId: number; productName: string; quantity: number; cost: number }>;
  }> {
    const queryBuilder = this.wasteRepository
      .createQueryBuilder('waste')
      .leftJoinAndSelect('waste.product', 'product')
      .where('waste.waste_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (warehouseId) {
      queryBuilder.andWhere('waste.warehouse_id = :warehouseId', { warehouseId });
    }

    const wastes = await queryBuilder.getMany();

    const totalWaste = wastes.reduce((sum, w) => sum + Number(w.quantity), 0);
    const totalCost = wastes.reduce((sum, w) => sum + Number(w.totalCost), 0);

    // Agrupar por tipo
    const byTypeMap = new Map<string, { quantity: number; cost: number }>();
    wastes.forEach((waste) => {
      const current = byTypeMap.get(waste.wasteType) || { quantity: 0, cost: 0 };
      byTypeMap.set(waste.wasteType, {
        quantity: current.quantity + Number(waste.quantity),
        cost: current.cost + Number(waste.totalCost),
      });
    });

    const byType = Array.from(byTypeMap.entries()).map(([type, data]) => ({
      type,
      quantity: data.quantity,
      cost: data.cost,
    }));

    // Agrupar por producto
    const byProductMap = new Map<number, { name: string; quantity: number; cost: number }>();
    wastes.forEach((waste) => {
      const current = byProductMap.get(waste.productId) || {
        name: waste.product?.name || 'Desconocido',
        quantity: 0,
        cost: 0,
      };
      byProductMap.set(waste.productId, {
        name: current.name,
        quantity: current.quantity + Number(waste.quantity),
        cost: current.cost + Number(waste.totalCost),
      });
    });

    const byProduct = Array.from(byProductMap.entries()).map(([productId, data]) => ({
      productId,
      productName: data.name,
      quantity: data.quantity,
      cost: data.cost,
    }));

    return {
      totalWaste,
      totalCost,
      byType,
      byProduct,
    };
  }
}
