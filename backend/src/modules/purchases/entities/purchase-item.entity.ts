import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Purchase } from './purchase.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'purchase_id', type: 'int' })
  purchaseId: number;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'quantity_ordered', type: 'numeric', precision: 14, scale: 4 })
  quantityOrdered: string;

  @Column({ name: 'quantity_received', type: 'numeric', precision: 14, scale: 4, default: 0 })
  quantityReceived: string;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 14, scale: 4 })
  unitCost: string;

  @Column({ name: 'tax_rate', type: 'numeric', precision: 5, scale: 2, default: 0 })
  taxRate: string;

  @Column({ name: 'discount_percentage', type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPercentage: string;

  @Column({ name: 'lot_number', type: 'varchar', length: 64, nullable: true })
  lotNumber?: string | null;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;
}