import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ReceivePurchaseDto } from './dto/receive-purchase.dto';
import { InventoryService } from '../inventory/services/inventory.service';
import { MovementType } from '../inventory/entities/inventory-movement.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    @InjectRepository(PurchaseItem) private itemRepo: Repository<PurchaseItem>,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: CreatePurchaseDto, userId?: number): Promise<Purchase> {
    if (!dto.items?.length) throw new BadRequestException('Purchase must have items');
    const purchase = this.purchaseRepo.create({
      branchId: dto.branchId,
      warehouseId: dto.warehouseId,
      supplierId: dto.supplierId,
      orderDate: dto.orderDate,
      expectedDeliveryDate: dto.expectedDeliveryDate,
      supplierInvoice: dto.supplierInvoice,
      paymentTerms: dto.paymentTerms,
      dueDate: dto.dueDate,
      notes: dto.notes,
      status: 'DRAFT',
      subtotal: '0',
      taxAmount: '0',
      discountAmount: '0',
      totalAmount: '0',
      createdBy: userId,
      items: dto.items.map((i) =>
        this.itemRepo.create({
          productId: i.productId,
          quantityOrdered: String(i.quantityOrdered),
          quantityReceived: '0',
          unitCost: String(i.unitCost),
          taxRate: String(i.taxRate ?? 0),
          discountPercentage: String(i.discountPercentage ?? 0),
        }),
      ),
    });
    const saved = await this.purchaseRepo.save(purchase);
    await this.recalculateTotals(saved.id);
    return this.findOne(saved.id);
  }

  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findOne({ where: { id }, relations: ['items'] });
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  async list(page = 1, limit = 20, status?: string, supplierId?: number) {
    const qb = this.purchaseRepo.createQueryBuilder('p');
    qb.leftJoinAndSelect('p.items', 'items');
    if (status) qb.andWhere('p.status = :status', { status });
    if (supplierId) qb.andWhere('p.supplier_id = :supplierId', { supplierId });
    qb.orderBy('p.id', 'DESC');
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async approve(id: number, userId?: number) {
    const purchase = await this.findOne(id);
    if (purchase.status !== 'DRAFT') throw new BadRequestException('Only DRAFT purchases can be approved');
    purchase.status = 'SENT';
    purchase.approvedBy = userId ?? null;
    await this.purchaseRepo.save(purchase);
    return purchase;
  }

  async receive(id: number, dto: ReceivePurchaseDto, userId?: number) {
    const purchase = await this.findOne(id);
    if (purchase.status === 'CANCELLED') throw new BadRequestException('Purchase is cancelled');
    if (purchase.items.every((i) => Number(i.quantityReceived) >= Number(i.quantityOrdered))) {
      throw new BadRequestException('Purchase already fully received');
    }

    for (const r of dto.items) {
      const item = purchase.items.find((i) => i.id === r.purchaseItemId);
      if (!item) throw new BadRequestException(`Item ${r.purchaseItemId} not found`);
      const already = Number(item.quantityReceived);
      const ordered = Number(item.quantityOrdered);
      const incoming = Number(r.quantityReceived);
      if (already + incoming > ordered) throw new BadRequestException('Cannot receive more than ordered');

      item.quantityReceived = String(already + incoming);
      item.lotNumber = r.lotNumber;
      item.expiryDate = r.expiryDate ?? null;
      await this.itemRepo.save(item);

      await this.inventoryService.createLot({
        productId: item.productId,
        warehouseId: purchase.warehouseId,
        lotNumber: r.lotNumber,
        productionDate: r.productionDate ?? undefined,
        expiryDate: r.expiryDate ?? undefined,
        initialQuantity: incoming,
        unitCost: Number(item.unitCost),
      }, userId ?? 0);

      await this.inventoryService.createMovement({
        productId: item.productId,
        warehouseId: purchase.warehouseId,
        lotId: undefined,
        movementType: MovementType.PURCHASE,
        referenceType: 'Purchase',
        referenceId: purchase.id,
        quantity: incoming,
        unitCost: Number(item.unitCost),
        notes: r.notes ?? undefined,
      }, userId ?? 0);
    }

    purchase.receivedDate = new Date(dto.receivedDate);
    const fullyReceived = purchase.items.every((i) => Number(i.quantityReceived) >= Number(i.quantityOrdered));
    purchase.status = fullyReceived ? 'RECEIVED' : 'PARTIAL';
    await this.purchaseRepo.save(purchase);
    await this.recalculateTotals(purchase.id);
    return this.findOne(purchase.id);
  }

  async recalculateTotals(id: number) {
    const purchase = await this.findOne(id);
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    for (const item of purchase.items) {
      const qty = Number(item.quantityOrdered);
      const cost = Number(item.unitCost);
      const discountPct = Number(item.discountPercentage ?? '0');
      const taxPct = Number(item.taxRate ?? '0');
      const lineSubtotal = qty * cost;
      const lineDiscount = lineSubtotal * (discountPct / 100);
      const base = lineSubtotal - lineDiscount;
      const lineTax = base * (taxPct / 100);
      subtotal += base;
      taxAmount += lineTax;
      discountAmount += lineDiscount;
    }
    const totalAmount = subtotal + taxAmount;
    purchase.subtotal = String(subtotal);
    purchase.taxAmount = String(taxAmount);
    purchase.discountAmount = String(discountAmount);
    purchase.totalAmount = String(totalAmount);
    await this.purchaseRepo.save(purchase);
  }
}