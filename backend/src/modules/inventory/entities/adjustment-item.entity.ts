import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InventoryAdjustment } from './inventory-adjustment.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { InventoryLot } from './inventory-lot.entity';

@Entity('adjustment_items')
@Index(['adjustmentId'])
export class AdjustmentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'adjustment_id', type: 'integer' })
  @Index()
  adjustmentId: number;

  @ManyToOne(() => InventoryAdjustment, (adjustment) => adjustment.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adjustment_id' })
  adjustment: InventoryAdjustment;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'product_id' })
  product: MenuItem;

  @Column({ name: 'lot_id', type: 'uuid' })
  lotId: string;

  @ManyToOne(() => InventoryLot)
  @JoinColumn({ name: 'lot_id' })
  lot: InventoryLot;

  @Column({
    name: 'system_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  systemQuantity: number;

  @Column({
    name: 'physical_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  physicalQuantity: number;

  @Column({
    name: 'difference',
    type: 'decimal',
    precision: 10,
    scale: 3,
    generatedType: 'STORED',
    asExpression: 'physical_quantity - system_quantity',
  })
  difference: number;

  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
  })
  unitCost: number;

  @Column({
    name: 'cost_impact',
    type: 'decimal',
    precision: 14,
    scale: 4,
    generatedType: 'STORED',
    asExpression: '(physical_quantity - system_quantity) * unit_cost',
  })
  costImpact: number;

  @Column({ type: 'text', nullable: true })
  reason: string;
}
