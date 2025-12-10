import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import {
  InventoryAdjustment,
  AdjustmentStatus,
} from '../entities/inventory-adjustment.entity';
import { AdjustmentItem } from '../entities/adjustment-item.entity';
import { InventoryLot, LotStatus } from '../entities/inventory-lot.entity';
import { InventoryMovement, MovementType } from '../entities/inventory-movement.entity';
import { CreateAdjustmentDto, ApproveAdjustmentDto } from '../dto/create-adjustment.dto';

@Injectable()
export class AdjustmentsService {
  constructor(
    @InjectRepository(InventoryAdjustment)
    private adjustmentRepository: Repository<InventoryAdjustment>,
    @InjectRepository(AdjustmentItem)
    private itemRepository: Repository<AdjustmentItem>,
    @InjectRepository(InventoryLot)
    private lotRepository: Repository<InventoryLot>,
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  async create(
    createAdjustmentDto: CreateAdjustmentDto,
    userId: number,
  ): Promise<InventoryAdjustment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear ajuste
      const adjustment = queryRunner.manager.create(InventoryAdjustment, {
        ...createAdjustmentDto,
        createdBy: userId,
        status: AdjustmentStatus.DRAFT,
      });

      const savedAdjustment = await queryRunner.manager.save(adjustment);

      // Crear items del ajuste
      const items = createAdjustmentDto.items.map((item) =>
        queryRunner.manager.create(AdjustmentItem, {
          ...item,
          adjustmentId: savedAdjustment.id,
        }),
      );

      await queryRunner.manager.save(items);

      await queryRunner.commitTransaction();

      return this.findOne(savedAdjustment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    warehouseId?: number,
    status?: AdjustmentStatus,
  ): Promise<InventoryAdjustment[]> {
    const queryBuilder = this.adjustmentRepository
      .createQueryBuilder('adjustment')
      .leftJoinAndSelect('adjustment.warehouse', 'warehouse')
      .leftJoinAndSelect('adjustment.creator', 'creator')
      .leftJoinAndSelect('adjustment.approver', 'approver')
      .leftJoinAndSelect('adjustment.applier', 'applier')
      .leftJoinAndSelect('adjustment.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.lot', 'lot');

    if (warehouseId) {
      queryBuilder.andWhere('adjustment.warehouse_id = :warehouseId', {
        warehouseId,
      });
    }

    if (status) {
      queryBuilder.andWhere('adjustment.status = :status', { status });
    }

    return queryBuilder.orderBy('adjustment.created_at', 'DESC').getMany();
  }

  async findOne(id: number): Promise<InventoryAdjustment> {
    const adjustment = await this.adjustmentRepository.findOne({
      where: { id },
      relations: [
        'warehouse',
        'creator',
        'approver',
        'applier',
        'items',
        'items.product',
        'items.lot',
      ],
    });

    if (!adjustment) {
      throw new NotFoundException(`Ajuste con ID ${id} no encontrado`);
    }

    return adjustment;
  }

  async approve(
    id: number,
    approveDto: ApproveAdjustmentDto,
    userId: number,
  ): Promise<InventoryAdjustment> {
    const adjustment = await this.findOne(id);

    if (adjustment.status !== AdjustmentStatus.DRAFT) {
      throw new BadRequestException(
        'Solo se pueden aprobar ajustes en estado DRAFT',
      );
    }

    adjustment.status = AdjustmentStatus.APPROVED;
    adjustment.approvedBy = userId;
    adjustment.approvedAt = new Date();
    // approvalNotes removed in entity; ignore approveDto.notes

    await this.adjustmentRepository.save(adjustment);

    return this.findOne(id);
  }

  async apply(id: number, userId: number): Promise<InventoryAdjustment> {
    const adjustment = await this.findOne(id);

    if (adjustment.status !== AdjustmentStatus.APPROVED) {
      throw new BadRequestException(
        'Solo se pueden aplicar ajustes en estado APPROVED',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Aplicar cada item del ajuste
      for (const item of adjustment.items) {
        const lot = await queryRunner.manager.findOne(InventoryLot, {
          where: { id: item.lotId } as FindOptionsWhere<InventoryLot>,
          lock: { mode: 'pessimistic_write' },
        });

        if (!lot) {
          throw new NotFoundException(`Lote ${item.lotId} no encontrado`);
        }

        // Actualizar cantidad del lote
        lot.currentQuantity = Number(item.physicalQuantity);

        // Actualizar estado si está agotado
        if (lot.currentQuantity <= 0) {
          lot.status = LotStatus.SOLD_OUT;
        }

        await queryRunner.manager.save(lot);

        // Registrar movimiento
        const movement = queryRunner.manager.create(InventoryMovement, {
          movementType: MovementType.ADJUSTMENT,
          referenceType: 'InventoryAdjustment',
          referenceId: adjustment.id,
          productId: item.productId,
          lotId: item.lotId,
          warehouseId: adjustment.warehouseId,
          quantity: Number(item.difference),
          unitCost: Number(item.unitCost),
          totalCost: Number(item.costImpact),
          userId,
          notes: `Ajuste: ${adjustment.adjustmentType} - ${item.reason || ''}`,
        });

        await queryRunner.manager.save(movement);
      }

      // Actualizar estado del ajuste
      adjustment.status = AdjustmentStatus.APPLIED;
      adjustment.appliedBy = userId;
      adjustment.appliedAt = new Date();

      await queryRunner.manager.save(adjustment);

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: number): Promise<InventoryAdjustment> {
    const adjustment = await this.findOne(id);

    if (adjustment.status === AdjustmentStatus.APPLIED) {
      throw new BadRequestException(
        'No se pueden cancelar ajustes ya aplicados',
      );
    }

    adjustment.status = AdjustmentStatus.CANCELLED;
    await this.adjustmentRepository.save(adjustment);

    return this.findOne(id);
  }
}
