// (removed duplicate minimal SalesService; keeping the full-feature implementation below)
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, EntityManager } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SalePayment } from './entities/sale-payment.entity';
import { CashRegisterSession } from './entities/cash-register-session.entity';
import { Product } from '../products/entities/product.entity';
import { InventoryLot, LotStatus } from '../inventory/entities/inventory-lot.entity';
import { InventoryMovement, MovementType } from '../inventory/entities/inventory-movement.entity';
import { User } from '../users/entities/user.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

interface LotAllocation {
  lotId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface ItemWithProduct {
  productId: string;
  quantity: number;
  weight?: number;
  discountPercentage?: number;
  notes?: string;
  product: Product;
}

interface CalculatedItem extends ItemWithProduct {
  unitPrice: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(SalePayment)
    private salePaymentRepository: Repository<SalePayment>,
    @InjectRepository(CashRegisterSession)
    private sessionRepository: Repository<CashRegisterSession>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(InventoryLot)
    private lotRepository: Repository<InventoryLot>,
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  /**
   * Crear una venta completa con algoritmo PEPS
   */
  async create(
    createSaleDto: CreateSaleDto,
    companyId: number,
    branchId: number,
    cashierId: string,
  ): Promise<Sale> {
    return (await this.dataSource.transaction(async (manager) => {
      // 1. Validar que la sesión esté abierta
      const session = await manager.findOne(CashRegisterSession, {
        where: { id: createSaleDto.sessionId },
      });

      if (!session) {
        throw new NotFoundException('Sesión de caja no encontrada');
      }

      if (session.status !== 'OPEN') {
        throw new BadRequestException(
          'La sesión de caja está cerrada. Debe abrir una nueva sesión.',
        );
      }

      // 2. Verificar que el cajero existe
      const cashierExists = await manager.exists(User, {
        where: { id: cashierId },
      });

      if (!cashierExists) {
        throw new NotFoundException('Cajero no encontrado');
      }

      // 3. Validar y cargar productos
      const itemsWithProducts: ItemWithProduct[] = [];
      for (const itemDto of createSaleDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId as any },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto ${itemDto.productId} no encontrado`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Producto ${product.name} no está activo`,
          );
        }

        // 3. Validar stock disponible
        const availableStock = await this.getAvailableStock(
          Number(itemDto.productId),
          branchId,
          manager,
        );

        const quantityNeeded = itemDto.weight || itemDto.quantity;
        if (availableStock < quantityNeeded) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Disponible: ${availableStock}, Solicitado: ${quantityNeeded}`,
          );
        }

        itemsWithProducts.push({
          ...itemDto,
          product,
        });
      }

      // 4. Generar número de venta
      const saleNumber = await this.generateSaleNumber(manager);

      // 5. Calcular totales
      const calculatedItems: CalculatedItem[] = [];
      for (const item of itemsWithProducts) {
        const unitPrice = Number(item.product.price) || 0;
        const quantity = item.weight || item.quantity;
        const subtotalBeforeDiscount = unitPrice * quantity;
        const discountPercentage = item.discountPercentage || 0;
        const discountAmount =
          (subtotalBeforeDiscount * discountPercentage) / 100;
        const subtotal = subtotalBeforeDiscount - discountAmount;

        // Tax rate 16% (configurable)
        const taxRate = 16;
        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        calculatedItems.push({
          ...item,
          unitPrice,
          quantity,
          subtotal,
          taxRate,
          taxAmount,
          discountPercentage,
          discountAmount,
          totalAmount,
        } as CalculatedItem);
      }

      const totals = this.calculateTotals(calculatedItems);

      // 6. Validar pagos
      this.validatePayments(createSaleDto.payments, totals.totalAmount);

      // 7. Crear venta
      const sale = new Sale();
      sale.companyId = companyId;
      sale.branchId = branchId;
      sale.saleNumber = saleNumber;
      sale.customerId = createSaleDto.customerId;
      sale.cashRegisterId = createSaleDto.cashRegisterId;
      sale.sessionId = createSaleDto.sessionId;
      sale.saleDate = new Date();
      sale.subtotal = totals.subtotal.toFixed(2);
      sale.taxAmount = totals.taxAmount.toFixed(2);
      sale.discountAmount = totals.discountAmount.toFixed(2);
      sale.totalAmount = totals.totalAmount.toFixed(2);
      sale.saleType = createSaleDto.saleType || 'RETAIL';
      sale.status = 'COMPLETED';
      sale.cashier = { id: cashierId } as any;
      sale.notes = createSaleDto.notes;

      const savedSale = await manager.save(sale);

      // 8. Crear items con asignación PEPS
      const saleItems: SaleItem[] = [];
      for (const item of calculatedItems) {
        // Asignar lotes con PEPS
        const allocations = await this.allocateLotsWithPEPS(
          Number(item.product.id),
          item.quantity,
          branchId,
          manager,
        );

        // Calcular costos
        const totalCost = allocations.reduce((sum, a) => sum + a.totalCost, 0);
        const unitCost = totalCost / item.quantity;

        const saleItem = manager.create(SaleItem, {
          sale: savedSale,
          product: item.product,
          quantity: item.quantity.toFixed(3),
          weight: item.weight ? item.weight.toFixed(3) : undefined,
          unitPrice: item.unitPrice.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
          taxRate: item.taxRate.toFixed(2),
          taxAmount: item.taxAmount.toFixed(2),
          discountPercentage: (item.discountPercentage || 0).toFixed(2),
          discountAmount: item.discountAmount.toFixed(2),
          totalAmount: item.totalAmount.toFixed(2),
          unitCost: unitCost.toFixed(2),
          totalCost: totalCost.toFixed(2),
          lotId: allocations[0]?.lotId,
          notes: item.notes,
        });

        const savedItem = await manager.save(SaleItem, saleItem);
        saleItems.push(savedItem);

        // 9. Descontar inventario y crear movements
        await this.deductInventoryAndCreateMovements(
          allocations,
          savedSale.id,
          savedItem.id,
          item.product.id,
          cashierId,
          manager,
        );
      }

      // 10. Crear pagos
      for (const paymentDto of createSaleDto.payments) {
        const payment = manager.create(SalePayment, {
          sale: savedSale,
          paymentMethod: paymentDto.paymentMethod,
          amount: paymentDto.amount.toFixed(2),
          paymentReference: paymentDto.paymentReference,
          cardLastDigits: paymentDto.cardLastDigits,
          cardType: paymentDto.cardType,
          paymentDate: new Date(),
        });

        await manager.save(SalePayment, payment);
      }

      // 11. Actualizar totales de sesión
      await this.updateSessionTotals(
        createSaleDto.sessionId,
        totals.totalAmount,
        createSaleDto.payments,
        manager,
      );

      this.logger.log(`Venta ${saleNumber} creada exitosamente`);

      // Retornar venta con relaciones
      return await manager.findOne(Sale, {
        where: { id: savedSale.id },
        relations: ['items', 'payments', 'customer', 'cashier'],
      });
    }))!;
  }

  /**
   * 🎲 ALGORITMO PEPS (FIFO)
   * Asigna lotes a la venta en orden de entrada
   */
  private async allocateLotsWithPEPS(
    productId: number,
    quantityNeeded: number,
    branchId: number,
    manager: EntityManager,
  ): Promise<LotAllocation[]> {
    // Buscar lotes disponibles ordenados por fecha de entrada (PEPS)
    const lots = await manager
      .createQueryBuilder(InventoryLot, 'lot')
      .innerJoin('lot.warehouse', 'warehouse')
      .where('lot.productId = :productId', { productId })
      .andWhere('lot.status = :status', { status: 'AVAILABLE' })
      .andWhere('lot.currentQuantity > 0')
      .andWhere('warehouse.branchId = :branchId', { branchId })
      .orderBy('lot.entryDate', 'ASC') // 🔑 PEPS
      .addOrderBy('lot.id', 'ASC')
      .setLock('pessimistic_write') // 🔒 Lock
      .getMany();

    if (lots.length === 0) {
      throw new BadRequestException(
        'No hay lotes disponibles para este producto',
      );
    }

    const allocations: LotAllocation[] = [];
    let remaining = quantityNeeded;

    for (const lot of lots) {
      if (remaining <= 0) break;

      const available = Number(lot.currentQuantity);
      const toAllocate = Math.min(available, remaining);

      allocations.push({
        lotId: lot.id,
        quantity: toAllocate,
        unitCost: Number(lot.unitCost),
        totalCost: toAllocate * Number(lot.unitCost),
      });

      remaining -= toAllocate;

      this.logger.log(
        `Asignado ${toAllocate} unidades del lote ${lot.lotNumber}`,
      );
    }

    if (remaining > 0) {
      throw new BadRequestException(
        `Stock insuficiente. Faltaron ${remaining} unidades`,
      );
    }

    return allocations;
  }

  /**
   * Descontar inventario y crear movimientos
   */
  private async deductInventoryAndCreateMovements(
    allocations: LotAllocation[],
    saleId: string,
    saleItemId: string,
    productId: number,
    userId: string,
    manager: EntityManager,
  ): Promise<void> {
    for (const allocation of allocations) {
      // 1. Actualizar cantidad del lote
      await manager.decrement(
        InventoryLot,
        { id: allocation.lotId },
        'currentQuantity',
        allocation.quantity,
      );

      // 2. Verificar si el lote se agotó
      const lot = await manager.findOne(InventoryLot, {
        where: { id: allocation.lotId },
      });

      if (!lot) {
        throw new BadRequestException('Lote no encontrado');
      }

      if (Number(lot.currentQuantity) <= 0) {
        lot.status = LotStatus.SOLD_OUT;
        await manager.save(InventoryLot, lot);
        this.logger.log(`Lote ${lot.lotNumber} agotado`);
      }

      // 3. Crear movimiento de inventario
      const movementData = {
        movementType: MovementType.SALE,
        referenceType: 'Sale',
        referenceId: Number(saleId.replace(/\D/g, '')) || undefined,
        productId: Number(productId),
        lotId: allocation.lotId,
        warehouseId: lot.warehouseId,
        quantity: -allocation.quantity,
        unitCost: allocation.unitCost,
        totalCost: allocation.totalCost,
        userId: Number(userId),
        movementDate: new Date(),
        notes: `Venta ${saleId}`,
      };
      const movement = manager.getRepository(InventoryMovement).create(movementData);
      await manager.save(movement);
    }
  }

  /**
   * Calcular totales de la venta
   */
  private calculateTotals(items: any[]): {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const discountAmount = items.reduce(
      (sum, item) => sum + item.discountAmount,
      0,
    );
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

    return { subtotal, taxAmount, discountAmount, totalAmount };
  }

  /**
   * Validar que los pagos cubran el total
   */
  private validatePayments(payments: any[], totalAmount: number): void {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    if (Math.abs(totalPaid - totalAmount) > 0.01) {
      throw new BadRequestException(
        `El total de pagos ($${totalPaid.toFixed(2)}) no coincide con el total de la venta ($${totalAmount.toFixed(2)})`,
      );
    }
  }

  /**
   * Actualizar totales de la sesión
   */
  private async updateSessionTotals(
    sessionId: string,
    saleAmount: number,
    payments: any[],
    manager: EntityManager,
  ): Promise<void> {
    const session = await manager.findOne(CashRegisterSession, {
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de caja no encontrada');
    }

    const currentTotalSales = Number(session.totalSales) || 0;
    session.totalSales = (currentTotalSales + saleAmount).toFixed(2);

    // Actualizar totales por método de pago
    for (const payment of payments) {
      if (payment.paymentMethod === 'CARD') {
        const currentCardTotal = Number(session.cardTotal) || 0;
        session.cardTotal = (currentCardTotal + payment.amount).toFixed(2);
      } else if (payment.paymentMethod === 'TRANSFER') {
        const currentTransferTotal = Number(session.transferTotal) || 0;
        session.transferTotal = (currentTransferTotal + payment.amount).toFixed(
          2,
        );
      }
    }

    await manager.save(CashRegisterSession, session);
  }

  /**
   * Obtener stock disponible
   */
  private async getAvailableStock(
    productId: number,
    branchId: number,
    manager: EntityManager,
  ): Promise<number> {
    const result = await manager
      .createQueryBuilder(InventoryLot, 'lot')
      .select('SUM(lot.currentQuantity)', 'total')
      .innerJoin('lot.warehouse', 'warehouse')
      .where('lot.productId = :productId', { productId })
      .andWhere('lot.status = :status', { status: 'AVAILABLE' })
      .andWhere('warehouse.branchId = :branchId', { branchId })
      .getRawOne();

    return Number(result?.total || 0);
  }

  /**
   * Generar número de venta
   */
  private async generateSaleNumber(manager: EntityManager): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `V${year}${month}${day}`;

    const lastSale = await manager
      .createQueryBuilder(Sale, 'sale')
      .select('sale.id')
      .addSelect('sale.saleNumber')
      .where('sale.saleNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('sale.saleNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.slice(-6));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(6, '0')}`;
  }

  /**
   * Listar ventas con filtros
   */
  async findAll(
    page = 1,
    limit = 20,
    startDate?: string,
    endDate?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (startDate && endDate) {
      where.saleDate = Between(new Date(startDate), new Date(endDate));
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.saleRepository.findAndCount({
      where,
      relations: ['items', 'payments', 'customer', 'cashier'],
      skip,
      take: limit,
      order: { saleDate: 'DESC' },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una venta por ID
   */
  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'payments',
        'customer',
        'cashier',
        'session',
        'cashRegister',
      ],
    });

    if (!sale) {
      throw new NotFoundException(`Venta ${id} no encontrada`);
    }

    return sale;
  }

  /**
   * Cancelar una venta
   */
  async cancel(id: string, companyId: number, userId: string): Promise<Sale> {
    return await this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(Sale, {
        where: { id },
        relations: ['items'],
      });

      if (!sale) {
        throw new NotFoundException(`Venta ${id} no encontrada`);
      }

      if (sale.status === 'CANCELLED') {
        throw new BadRequestException('La venta ya está cancelada');
      }

      // Revertir inventario
      for (const item of sale.items) {
        if (item.lotId) {
          // Incrementar cantidad del lote
          await manager.increment(
            InventoryLot,
            { id: item.lotId },
            'currentQuantity',
            Number(item.quantity),
          );

          // Actualizar status a AVAILABLE si estaba SOLD_OUT
          await manager.update(
            InventoryLot,
            { id: item.lotId, status: LotStatus.SOLD_OUT },
            { status: LotStatus.AVAILABLE },
          );

          // Crear movimiento de reversión
          const movementData = {
            movementType: MovementType.ADJUSTMENT,
            referenceType: 'Sale',
            referenceId: Number(id.replace(/\D/g, '')) || undefined,
            productId: Number(item.product.id),
            lotId: item.lotId,
            quantity: Number(item.quantity), // Positivo = entrada
            unitCost: Number(item.unitCost),
            totalCost: Number(item.totalCost),
            userId: Number(userId),
            movementDate: new Date(),
            notes: `Cancelación de venta ${sale.saleNumber}`,
          };
          const movement = manager.getRepository(InventoryMovement).create(movementData);
          await manager.save(movement);
        }
      }

      // Cambiar status de la venta
      sale.status = 'CANCELLED';
      await manager.save(Sale, sale);

      this.logger.log(`Venta ${sale.saleNumber} cancelada`);

      return sale;
    });
  }
}
