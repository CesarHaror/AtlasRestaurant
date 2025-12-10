import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseItem } from './purchase-item.entity';

export type PurchaseStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'purchase_number', length: 32, nullable: true })
  purchaseNumber?: string;

  @Column({ type: 'varchar', length: 10, default: 'DRAFT' })
  status: PurchaseStatus;

  @Column({ name: 'branch_id', type: 'int' })
  branchId: number;

  @Column({ name: 'warehouse_id', type: 'int' })
  warehouseId: number;

  @Column({ name: 'supplier_id', type: 'int' })
  supplierId: number;

  @Column({ name: 'order_date', type: 'date' })
  orderDate: string;

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate?: string | null;

  @Column({ name: 'supplier_invoice', type: 'varchar', length: 64, nullable: true })
  supplierInvoice?: string | null;

  @Column({ name: 'payment_terms', type: 'varchar', length: 64, nullable: true })
  paymentTerms?: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'subtotal', type: 'numeric', precision: 14, scale: 4, default: 0 })
  subtotal: string;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 14, scale: 4, default: 0 })
  taxAmount: string;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 14, scale: 4, default: 0 })
  discountAmount: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 14, scale: 4, default: 0 })
  totalAmount: string;

  @Column({ name: 'received_date', type: 'timestamp', nullable: true })
  receivedDate?: Date | null;

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy?: number | null;

  @Column({ name: 'approved_by', type: 'int', nullable: true })
  approvedBy?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items: PurchaseItem[];
}