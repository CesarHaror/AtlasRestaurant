import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, QueryFailedError } from 'typeorm';
import { InventoryLot, LotStatus } from '../entities/inventory-lot.entity';
import { InventoryMovement, MovementType } from '../entities/inventory-movement.entity';
import { InventoryTransfer } from '../entities/inventory-transfer.entity';
import { CreateLotDto, UpdateLotDto } from '../dto/create-lot.dto';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { CreateTransferDto } from '../dto/create-transfer.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryLot)
    private lotRepository: Repository<InventoryLot>,
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    @InjectRepository(InventoryTransfer)
    private transferRepository: Repository<InventoryTransfer>,
    private dataSource: DataSource,
  ) {}

  // ==================== LOTES ====================

  async createLot(createLotDto: CreateLotDto, userId: number): Promise<InventoryLot> {
    // Verificar que no exista un lote externo duplicado para el mismo producto/almacén
    const existingLot = await this.lotRepository.findOne({
      where: {
        productId: createLotDto.productId,
        warehouseId: createLotDto.warehouseId,
        lotNumber: createLotDto.lotNumber,
      } as FindOptionsWhere<InventoryLot>,
    });

    if (existingLot) {
      throw new BadRequestException(
        `Ya existe un lote externo ${createLotDto.lotNumber} para este producto en este almacén`,
      );
    }

    let attempts = 0;
    const maxAttempts = 5;
    let savedLot: InventoryLot | null = null;
    let lastError: any;

    while (attempts < maxAttempts && !savedLot) {
      const internalLot = await this.generateInternalLotNumber(
        createLotDto.warehouseId,
      );

      const lot = this.lotRepository.create({
        ...createLotDto,
        internalLot,
        currentQuantity: createLotDto.initialQuantity,
        entryDate: new Date(),
      });

      try {
        savedLot = await this.lotRepository.save(lot);
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          /internal_lot.*unique/i.test(error.message)
        ) {
          // Colisión por condición de carrera: reintentar con nuevo internalLot
          attempts++;
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    if (!savedLot) {
      throw new BadRequestException(
        `No se pudo generar un número interno único después de ${maxAttempts} intentos. Detalles: ${lastError?.message}`,
      );
    }

    // Registrar movimiento de entrada
    await this.createMovement({
      movementType: MovementType.PURCHASE,
      productId: createLotDto.productId,
      lotId: savedLot.id,
      warehouseId: createLotDto.warehouseId,
      quantity: createLotDto.initialQuantity,
      unitCost: createLotDto.unitCost,
      notes: `Entrada de lote ${createLotDto.lotNumber}`,
    }, userId);

    return savedLot;
  }

  async findLot(id: string): Promise<InventoryLot> {
    const lot = await this.lotRepository.findOne({
      where: { id } as FindOptionsWhere<InventoryLot>,
      relations: ['product', 'warehouse'],
    });

    if (!lot) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }

    return lot;
  }

  async findLotsByProduct(
    productId: number,
    warehouseId?: number,
  ): Promise<InventoryLot[]> {
    const where: FindOptionsWhere<InventoryLot> = {
      productId,
      status: LotStatus.AVAILABLE,
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return this.lotRepository.find({
      where,
      relations: ['product', 'warehouse'],
      order: {
        entryDate: 'ASC', // FIFO
      },
    });
  }

  async findLotsByWarehouse(warehouseId: number): Promise<InventoryLot[]> {
    return this.lotRepository.find({
      where: {
        warehouseId,
        status: LotStatus.AVAILABLE,
      } as FindOptionsWhere<InventoryLot>,
      relations: ['product', 'warehouse'],
      order: { entryDate: 'ASC' },
    });
  }

  async findAllLots(params?: { productId?: number; warehouseId?: number; search?: string; status?: LotStatus }): Promise<InventoryLot[]> {
    const queryBuilder = this.lotRepository
      .createQueryBuilder('lot')
      .leftJoinAndSelect('lot.product', 'product')
      .leftJoinAndSelect('lot.warehouse', 'warehouse');

    if (params?.productId) {
      queryBuilder.andWhere('lot.product_id = :productId', { productId: params.productId });
    }
    if (params?.warehouseId) {
      queryBuilder.andWhere('lot.warehouse_id = :warehouseId', { warehouseId: params.warehouseId });
    }
    if (params?.status) {
      queryBuilder.andWhere('lot.status = :status', { status: params.status });
    }
    if (params?.search) {
      const search = `%${params.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(lot.lot_number) LIKE :search OR LOWER(product.name) LIKE :search OR LOWER(product.sku) LIKE :search)',
        { search },
      );
    }

    return queryBuilder
      .orderBy('lot.entry_date', 'DESC')
      .addOrderBy('lot.id', 'DESC')
      .getMany();
  }

  async updateLot(id: string, updateLotDto: UpdateLotDto): Promise<InventoryLot> {
    const lot = await this.findLot(id);

    Object.assign(lot, updateLotDto);

    // Actualizar estado si está agotado
    if (lot.currentQuantity <= 0) {
      lot.status = LotStatus.SOLD_OUT;
    }

    return this.lotRepository.save(lot);
  }

  // ==================== MOVIMIENTOS ====================

  async createMovement(
    createMovementDto: CreateMovementDto,
    userId: number,
  ): Promise<InventoryMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const totalCost = createMovementDto.unitCost
        ? createMovementDto.unitCost * createMovementDto.quantity
        : undefined;

      let lotId = createMovementDto.lotId;

      // ========== LÓGICA ESPECIAL POR TIPO DE MOVIMIENTO ==========

      if (
        createMovementDto.movementType === MovementType.PURCHASE ||
        createMovementDto.movementType === MovementType.INITIAL
      ) {
        // COMPRA / STOCK INICIAL: Crear lote automáticamente si no existe
        if (!lotId) {
          const lotNumber = 
            createMovementDto.movementType === MovementType.INITIAL
              ? `INITIAL-${Date.now()}`
              : `LOT-${Date.now()}`;
          const internalLot = await this.generateInternalLotNumber(createMovementDto.warehouseId);
          
          const lot = queryRunner.manager.create(InventoryLot, {
            productId: createMovementDto.productId,
            warehouseId: createMovementDto.warehouseId,
            lotNumber,
            internalLot,
            initialQuantity: createMovementDto.quantity,
            currentQuantity: createMovementDto.quantity,
            reservedQuantity: 0,
            unitCost: createMovementDto.unitCost || 0,
            status: LotStatus.AVAILABLE,
            entryDate: new Date(),
          });
          
          const savedLot = await queryRunner.manager.save(lot);
          lotId = savedLot.id;
        } else {
          // Si existe lote, actualizar su cantidad
          const lot = await queryRunner.manager.findOne(InventoryLot, {
            where: { id: lotId } as FindOptionsWhere<InventoryLot>,
            lock: { mode: 'pessimistic_write' },
          });
          
          if (!lot) {
            throw new NotFoundException(`Lote ${lotId} no encontrado`);
          }
          
          lot.currentQuantity = Number(lot.currentQuantity) + createMovementDto.quantity;
          lot.initialQuantity = Number(lot.initialQuantity) + createMovementDto.quantity;
          await queryRunner.manager.save(lot);
        }
      } else if (
        createMovementDto.movementType === MovementType.ADJUSTMENT ||
        createMovementDto.movementType === MovementType.WASTE ||
        createMovementDto.movementType === MovementType.SALE
      ) {
        // AJUSTE/DESPERDICIO/VENTA: Validar y actualizar lote si se especifica
        // Para WASTE y SALE, negar automáticamente la cantidad (es una resta)
        let adjustmentQuantity = createMovementDto.quantity;
        if (createMovementDto.movementType === MovementType.WASTE || 
            createMovementDto.movementType === MovementType.SALE) {
          adjustmentQuantity = -Math.abs(adjustmentQuantity);
        }
        
        if (lotId) {
          const lot = await queryRunner.manager.findOne(InventoryLot, {
            where: { id: lotId } as FindOptionsWhere<InventoryLot>,
            lock: { mode: 'pessimistic_write' },
          });
          
          if (!lot) {
            throw new NotFoundException(`Lote ${lotId} no encontrado`);
          }
          
          const newQuantity = Number(lot.currentQuantity) + adjustmentQuantity;
          
          // Validar que no quede negativo
          if (newQuantity < 0) {
            throw new BadRequestException(
              `Stock insuficiente. Disponible: ${lot.currentQuantity}, solicitado: ${Math.abs(adjustmentQuantity)}`,
            );
          }
          
          // Si es ajuste positivo, aumentar initial_quantity también
          if (adjustmentQuantity > 0) {
            lot.initialQuantity = Number(lot.initialQuantity) + adjustmentQuantity;
          }
          
          lot.currentQuantity = newQuantity;
          
          // Si se agota el lote, marcar como SOLD_OUT
          if (lot.currentQuantity <= 0) {
            lot.status = LotStatus.SOLD_OUT;
          }
          
          await queryRunner.manager.save(lot);
        } else {
          // Si no se especifica lote para ajuste/venta/desperdicio, buscar uno FIFO para actualizar
          const lots = await queryRunner.manager.find(InventoryLot, {
            where: {
              productId: createMovementDto.productId,
              warehouseId: createMovementDto.warehouseId,
              status: LotStatus.AVAILABLE,
            } as FindOptionsWhere<InventoryLot>,
            order: { entryDate: 'ASC' },
            lock: { mode: 'pessimistic_write' },
          });
          
          if (adjustmentQuantity < 0 && lots.length === 0) {
            throw new BadRequestException(
              `No hay lotes disponibles para restar en el almacén`,
            );
          }
          
          if (adjustmentQuantity > 0) {
            // Ajuste positivo: usar el primer lote (o el que tengas lógica)
            if (lots.length === 0) {
              throw new BadRequestException(
                `No hay lotes disponibles para ajustar en el almacén`,
              );
            }
            
            const lot = lots[0];
            lot.currentQuantity = Number(lot.currentQuantity) + adjustmentQuantity;
            lot.initialQuantity = Number(lot.initialQuantity) + adjustmentQuantity;
            await queryRunner.manager.save(lot);
            lotId = lot.id;
          } else {
            // Ajuste/Venta/Desperdicio negativo: restar de FIFO, puede abarcar múltiples lotes
            let remaining = Math.abs(adjustmentQuantity);
            let currentLotIndex = 0;
            
            while (remaining > 0 && currentLotIndex < lots.length) {
              const current = lots[currentLotIndex];
              const available = Number(current.currentQuantity);
              
              const toSubtract = Math.min(available, remaining);
              current.currentQuantity = Number(current.currentQuantity) - toSubtract;
              
              if (current.currentQuantity <= 0) {
                current.status = LotStatus.SOLD_OUT;
              }
              
              await queryRunner.manager.save(current);
              remaining -= toSubtract;
              currentLotIndex++;
            }
            
            if (remaining > 0) {
              throw new BadRequestException(
                `Stock insuficiente para restar. Faltan ${remaining} unidades`,
              );
            }
            
            lotId = lots[0].id;
          }
        }
      } else if (createMovementDto.movementType === MovementType.TRANSFER) {
        // TRANSFERENCIA: Se manejará con un endpoint especializado
        throw new BadRequestException(
          'Para transferencias, use el endpoint especializado /inventory/transfers',
        );
      }

      // ========== CREAR MOVIMIENTO ==========
      
      const movement = queryRunner.manager.create(InventoryMovement, {
        ...createMovementDto,
        lotId,
        totalCost,
        userId,
        movementDate: new Date(),
      });

      const savedMovement = await queryRunner.manager.save(movement);
      await queryRunner.commitTransaction();

      return savedMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllMovements(
    startDate?: Date,
    endDate?: Date,
  ): Promise<InventoryMovement[]> {
    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.lot', 'lot')
      .leftJoinAndSelect('movement.user', 'user');

    if (startDate) {
      queryBuilder.andWhere('movement.movement_date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('movement.movement_date <= :endDate', { endDate });
    }

    return queryBuilder
      .orderBy('movement.movement_date', 'DESC')
      .getMany();
  }

  async findMovementsByProduct(
    productId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InventoryMovement[]> {
    const queryBuilder = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.lot', 'lot')
      .leftJoinAndSelect('movement.user', 'user')
      .where('movement.product_id = :productId', { productId });

    if (startDate) {
      queryBuilder.andWhere('movement.movement_date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('movement.movement_date <= :endDate', { endDate });
    }

    return queryBuilder
      .orderBy('movement.movement_date', 'DESC')
      .getMany();
  }

  // ==================== STOCK ACTUAL ====================

  async getCurrentStock(
    productId: number,
    warehouseId?: number,
  ): Promise<Array<{
    productId: number;
    warehouseId?: number;
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    averageCost: number;
    totalValue: number;
    lotCount: number;
    earliestExpiry: Date | null;
    lots: InventoryLot[];
    product?: any;
    warehouse?: any;
  }>> {
    const where: FindOptionsWhere<InventoryLot> = {
      productId,
      status: LotStatus.AVAILABLE,
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const lots = await this.lotRepository.find({
      where,
      relations: ['product', 'warehouse'],
    });

    const groups = new Map<string, InventoryLot[]>();
    for (const lot of lots) {
      const key = `${lot.productId}-${lot.warehouseId ?? 'all'}`;
      const arr = groups.get(key) ?? [];
      arr.push(lot);
      groups.set(key, arr);
    }

    const results: Array<{
      productId: number;
      warehouseId?: number;
      totalQuantity: number;
      availableQuantity: number;
      reservedQuantity: number;
      averageCost: number;
      totalValue: number;
      lotCount: number;
      earliestExpiry: Date | null;
      lots: InventoryLot[];
      product?: any;
      warehouse?: any;
    }> = [];

    for (const [, groupLots] of groups) {
      const totalQuantity = groupLots.reduce(
        (sum, lot) => sum + Number(lot.currentQuantity),
        0,
      );
      const reservedQuantity = groupLots.reduce(
        (sum, lot) => sum + Number(lot.reservedQuantity),
        0,
      );
      const availableQuantity = totalQuantity - reservedQuantity;
      const totalCost = groupLots.reduce(
        (sum, lot) => sum + Number(lot.totalCost),
        0,
      );
      const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
      const expiryDates = groupLots
        .map((l) => l.expiryDate ? new Date(l.expiryDate as any) : null)
        .filter((d): d is Date => !!d && !isNaN(d.getTime()));
      const earliestExpiry = expiryDates.length
        ? new Date(Math.min(...expiryDates.map((d) => d.getTime())))
        : null;

      results.push({
        productId: groupLots[0].productId,
        warehouseId: groupLots[0].warehouseId,
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        averageCost,
        totalValue: Number(totalCost),
        lotCount: groupLots.length,
        earliestExpiry,
        lots: groupLots,
        product: groupLots[0].product,
        warehouse: groupLots[0].warehouse,
      });
    }

    return results;
  }

  async getStockSummaryAll(): Promise<Array<{
    productId: number;
    warehouseId?: number;
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    averageCost: number;
    totalValue: number;
    lotCount: number;
    earliestExpiry: Date | null;
    lots: InventoryLot[];
    product?: any;
    warehouse?: any;
  }>> {
    const lots = await this.lotRepository.find({
      where: { status: LotStatus.AVAILABLE },
      relations: ['product', 'warehouse'],
    });

    const groups = new Map<string, InventoryLot[]>();
    for (const lot of lots) {
      const key = `${lot.productId}-${lot.warehouseId}`;
      const arr = groups.get(key) ?? [];
      arr.push(lot);
      groups.set(key, arr);
    }

    const results: Array<{[K in keyof ReturnType<typeof Object>]: never}> = [] as any;

    for (const [, groupLots] of groups) {
      const totalQuantity = groupLots.reduce(
        (sum, lot) => sum + Number(lot.currentQuantity),
        0,
      );
      const reservedQuantity = groupLots.reduce(
        (sum, lot) => sum + Number(lot.reservedQuantity),
        0,
      );
      const availableQuantity = totalQuantity - reservedQuantity;
      const totalCost = groupLots.reduce(
        (sum, lot) => sum + Number(lot.totalCost),
        0,
      );
      const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
      const expiryDates = groupLots
        .map((l) => l.expiryDate ? new Date(l.expiryDate as any) : null)
        .filter((d): d is Date => !!d && !isNaN(d.getTime()));
      const earliestExpiry = expiryDates.length
        ? new Date(Math.min(...expiryDates.map((d) => d.getTime())))
        : null;

      (results as any).push({
        productId: groupLots[0].productId,
        warehouseId: groupLots[0].warehouseId,
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        averageCost,
        totalValue: Number(totalCost),
        lotCount: groupLots.length,
        earliestExpiry,
        lots: groupLots,
        product: groupLots[0].product,
        warehouse: groupLots[0].warehouse,
      });
    }

    return results as any;
  }

  async getStockByWarehouse(warehouseId: number) {
    const lots = await this.lotRepository.find({
      where: { warehouseId, status: LotStatus.AVAILABLE },
      relations: ['product', 'warehouse'],
    });

    const groups = new Map<number, InventoryLot[]>();
    for (const lot of lots) {
      const arr = groups.get(lot.productId) ?? [];
      arr.push(lot);
      groups.set(lot.productId, arr);
    }

    const results: any[] = [];
    for (const [, groupLots] of groups) {
      const totalQuantity = groupLots.reduce(
        (sum, lot) => sum + Number(lot.currentQuantity),
        0,
      );
      const reservedQuantity = groupLots.reduce(
        (sum, lot) => sum + Number(lot.reservedQuantity),
        0,
      );
      const availableQuantity = totalQuantity - reservedQuantity;
      const totalCost = groupLots.reduce(
        (sum, lot) => sum + Number(lot.totalCost),
        0,
      );
      const averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
      const expiryDates = groupLots
        .map((l) => l.expiryDate ? new Date(l.expiryDate as any) : null)
        .filter((d): d is Date => !!d && !isNaN(d.getTime()));
      const earliestExpiry = expiryDates.length
        ? new Date(Math.min(...expiryDates.map((d) => d.getTime())))
        : null;

      results.push({
        productId: groupLots[0].productId,
        warehouseId: warehouseId,
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        averageCost,
        totalValue: Number(totalCost),
        lotCount: groupLots.length,
        earliestExpiry,
        lots: groupLots,
        product: groupLots[0].product,
        warehouse: groupLots[0].warehouse,
      });
    }

    return results;
  }

  // ==================== ASIGNACIÃ"N FIFO (PEPS) ====================

  async allocateStock(
    productId: number,
    warehouseId: number,
    quantity: number,
  ): Promise<Array<{ lot: InventoryLot; quantity: number }>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener lotes disponibles ordenados por FIFO
      const lots = await queryRunner.manager.find(InventoryLot, {
        where: {
          productId,
          warehouseId,
          status: LotStatus.AVAILABLE,
        },
        order: {
          entryDate: 'ASC',
          id: 'ASC',
        },
        lock: { mode: 'pessimistic_write' }, // Lock para concurrencia
      });

      let remaining = quantity;
      const allocations: Array<{ lot: InventoryLot; quantity: number }> = [];

      for (const lot of lots) {
        if (remaining <= 0) break;

        const available = Number(lot.currentQuantity) - Number(lot.reservedQuantity);
        if (available <= 0) continue;

        const toAllocate = Math.min(available, remaining);

        allocations.push({
          lot,
          quantity: toAllocate,
        });

        remaining -= toAllocate;
      }

      if (remaining > 0) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(
          `Stock insuficiente. Faltan ${remaining} unidades`,
        );
      }

      await queryRunner.commitTransaction();
      return allocations;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async consumeStock(
    allocations: Array<{ lot: InventoryLot; quantity: number }>,
    userId: number,
    referenceType?: string,
    referenceId?: number,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const allocation of allocations) {
        const lot = await queryRunner.manager.findOne(InventoryLot, {
          where: { id: allocation.lot.id } as FindOptionsWhere<InventoryLot>,
          lock: { mode: 'pessimistic_write' },
        });

        if (!lot) {
          throw new NotFoundException(`Lote ${allocation.lot.id} no encontrado`);
        }

        // Reducir cantidad
        lot.currentQuantity = Number(lot.currentQuantity) - allocation.quantity;

        // Actualizar estado si está agotado
        if (lot.currentQuantity <= 0) {
          lot.status = LotStatus.SOLD_OUT;
        }

        await queryRunner.manager.save(lot);

        // Registrar movimiento
        const movement = queryRunner.manager.create(InventoryMovement, {
          movementType: MovementType.SALE,
          referenceType,
          referenceId,
          productId: lot.productId,
          lotId: lot.id,
          warehouseId: lot.warehouseId,
          quantity: -allocation.quantity, // Negativo para salida
          unitCost: lot.unitCost,
          totalCost: Number((Number(lot.unitCost) * allocation.quantity).toFixed(4)),
          userId,
          movementDate: new Date(),
        });

        await queryRunner.manager.save(movement);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== PRODUCTOS POR VENCER ====================

  async getExpiringProducts(
    daysThreshold: number = 30,
    warehouseId?: number,
  ): Promise<InventoryLot[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const queryBuilder = this.lotRepository
      .createQueryBuilder('lot')
      .leftJoinAndSelect('lot.product', 'product')
      .leftJoinAndSelect('lot.warehouse', 'warehouse')
      .where('lot.status = :status', { status: LotStatus.AVAILABLE })
      .andWhere('lot.expiry_date IS NOT NULL')
      .andWhere('lot.expiry_date <= :thresholdDate', { thresholdDate })
      .andWhere('lot.current_quantity > 0');

    if (warehouseId) {
      queryBuilder.andWhere('lot.warehouse_id = :warehouseId', { warehouseId });
    }

    return queryBuilder
      .orderBy('lot.expiry_date', 'ASC')
      .getMany();
  }

  // ==================== UTILIDADES ====================

  private async generateInternalLotNumber(warehouseId: number): Promise<string> {
    const date = new Date();
    const yearMonth = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    const prefix = `INT-${yearMonth}-`;

    // Obtener último internal_lot para este almacén y periodo
    const last = await this.lotRepository
      .createQueryBuilder('lot')
      .select('lot.internalLot', 'internalLot')
      .where('lot.warehouseId = :warehouseId', { warehouseId })
      .andWhere('lot.internalLot LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('lot.internalLot', 'DESC')
      .limit(1)
      .getRawOne();

    let nextSeq = 1;
    if (last?.internalLot) {
      const parts = String(last.internalLot).split('-');
      const seqStr = parts[2];
      const num = parseInt(seqStr, 10);
      if (!isNaN(num)) nextSeq = num + 1;
    }

    // Intentar generar único con verificación
    for (let i = 0; i < 10; i++) {
      const candidate = `${prefix}${(nextSeq + i).toString().padStart(4, '0')}`;
      const exists = await this.lotRepository.findOne({
        where: { internalLot: candidate } as FindOptionsWhere<InventoryLot>,
      });
      if (!exists) return candidate;
    }

    // Fallback extremo: agregar sufijo temporal
    return `${prefix}${(nextSeq + 10).toString().padStart(4, '0')}-${Date.now().toString().slice(-5)}`;
  }

  async markExpiredLots(): Promise<number> {
    const result = await this.lotRepository
      .createQueryBuilder()
      .update(InventoryLot)
      .set({ status: LotStatus.EXPIRED })
      .where('expiry_date < :today', { today: new Date() })
      .andWhere('status = :status', { status: LotStatus.AVAILABLE })
      .execute();

    return result.affected || 0;
  }

  // ==================== TRANSFERENCIAS ====================

  async createTransfer(
    createTransferDto: CreateTransferDto,
    userId: number,
  ): Promise<InventoryTransfer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validaciones iniciales
      if (createTransferDto.sourceWarehouseId === createTransferDto.destinationWarehouseId) {
        throw new BadRequestException(
          'El almacén origen y destino no pueden ser el mismo',
        );
      }

      if (createTransferDto.quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      // Obtener el lote origen con lock
      const sourceLot = await queryRunner.manager.findOne(InventoryLot, {
        where: {
          id: createTransferDto.lotId,
          productId: createTransferDto.productId,
          warehouseId: createTransferDto.sourceWarehouseId,
        } as any,
        relations: ['product'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!sourceLot) {
        throw new NotFoundException(
          `Lote no encontrado en el almacén origen`,
        );
      }

      // Validar cantidad disponible
      if (sourceLot.currentQuantity < createTransferDto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${sourceLot.currentQuantity}, solicitado: ${createTransferDto.quantity}`,
        );
      }

      // 1. Restar del lote origen
      sourceLot.currentQuantity = Number(sourceLot.currentQuantity) - createTransferDto.quantity;
      
      if (sourceLot.currentQuantity <= 0) {
        sourceLot.status = LotStatus.SOLD_OUT;
      }

      await queryRunner.manager.save(sourceLot);

      // 2. Buscar o crear lote en almacén destino
      let destinationLot = await queryRunner.manager.findOne(InventoryLot, {
        where: {
          productId: createTransferDto.productId,
          warehouseId: createTransferDto.destinationWarehouseId,
          lotNumber: sourceLot.lotNumber, // Mismo número de lote
          status: LotStatus.AVAILABLE,
        } as any,
        lock: { mode: 'pessimistic_write' },
      });

      if (!destinationLot) {
        // Crear nuevo lote en destino con mismo número de lote
        const internalLot = await this.generateInternalLotNumber(
          createTransferDto.destinationWarehouseId,
        );

        destinationLot = queryRunner.manager.create(InventoryLot, {
          productId: createTransferDto.productId,
          warehouseId: createTransferDto.destinationWarehouseId,
          lotNumber: sourceLot.lotNumber, // Mantener mismo número
          internalLot,
          initialQuantity: createTransferDto.quantity,
          currentQuantity: createTransferDto.quantity,
          reservedQuantity: 0,
          unitCost: sourceLot.unitCost,
          status: LotStatus.AVAILABLE,
          entryDate: sourceLot.entryDate,
          expiryDate: sourceLot.expiryDate,
        });

        await queryRunner.manager.save(destinationLot);
      } else {
        // Agregar cantidad al lote existente
        destinationLot.currentQuantity = Number(destinationLot.currentQuantity) + createTransferDto.quantity;
        destinationLot.initialQuantity = Number(destinationLot.initialQuantity) + createTransferDto.quantity;
        await queryRunner.manager.save(destinationLot);
      }

      // 3. Registrar la transferencia
      const transfer = queryRunner.manager.create(InventoryTransfer, {
        sourceWarehouseId: createTransferDto.sourceWarehouseId,
        destinationWarehouseId: createTransferDto.destinationWarehouseId,
        productId: createTransferDto.productId,
        lotId: createTransferDto.lotId,
        quantity: createTransferDto.quantity,
        unitCost: sourceLot.unitCost,
        notes: createTransferDto.notes,
        userId,
      } as any);

      const savedTransfer = await queryRunner.manager.save(transfer);

      // 4. Registrar movimientos de salida e entrada
      const outgoingMovement = queryRunner.manager.create(InventoryMovement, {
        movementType: MovementType.TRANSFER,
        productId: createTransferDto.productId,
        lotId: createTransferDto.lotId,
        warehouseId: createTransferDto.sourceWarehouseId,
        quantity: -createTransferDto.quantity, // Negativo = salida
        unitCost: sourceLot.unitCost,
        totalCost: Number((Number(sourceLot.unitCost) * createTransferDto.quantity).toFixed(4)),
        notes: `Transferencia enviada a almacén ${createTransferDto.destinationWarehouseId}`,
        userId,
        movementDate: new Date(),
      });

      await queryRunner.manager.save(outgoingMovement);

      const incomingMovement = queryRunner.manager.create(InventoryMovement, {
        movementType: MovementType.TRANSFER,
        productId: createTransferDto.productId,
        lotId: destinationLot.id,
        warehouseId: createTransferDto.destinationWarehouseId,
        quantity: createTransferDto.quantity, // Positivo = entrada
        unitCost: sourceLot.unitCost,
        totalCost: Number((Number(sourceLot.unitCost) * createTransferDto.quantity).toFixed(4)),
        notes: `Transferencia recibida de almacén ${createTransferDto.sourceWarehouseId}`,
        userId,
        movementDate: new Date(),
      });

      await queryRunner.manager.save(incomingMovement);

      await queryRunner.commitTransaction();
      return savedTransfer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllTransfers(
    sourceWarehouseId?: number,
    destinationWarehouseId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InventoryTransfer[]> {
    const queryBuilder = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.sourceWarehouse', 'sourceWarehouse')
      .leftJoinAndSelect('transfer.destinationWarehouse', 'destinationWarehouse')
      .leftJoinAndSelect('transfer.product', 'product')
      .leftJoinAndSelect('transfer.lot', 'lot');

    if (sourceWarehouseId) {
      queryBuilder.andWhere('transfer.sourceWarehouseId = :sourceWarehouseId', {
        sourceWarehouseId,
      });
    }

    if (destinationWarehouseId) {
      queryBuilder.andWhere('transfer.destinationWarehouseId = :destinationWarehouseId', {
        destinationWarehouseId,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('transfer.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transfer.createdAt <= :endDate', { endDate });
    }

    return queryBuilder
      .orderBy('transfer.createdAt', 'DESC')
      .getMany();
  }

  async findTransfersByProduct(productId: number): Promise<InventoryTransfer[]> {
    return this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.sourceWarehouse', 'sourceWarehouse')
      .leftJoinAndSelect('transfer.destinationWarehouse', 'destinationWarehouse')
      .leftJoinAndSelect('transfer.product', 'product')
      .leftJoinAndSelect('transfer.lot', 'lot')
      .where('transfer.productId = :productId', { productId })
      .orderBy('transfer.createdAt', 'DESC')
      .getMany();
  }
}
