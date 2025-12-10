import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Warehouse } from './warehouse.entity';
import { InventoryMovement } from './inventory-movement.entity';

export enum LotStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  SOLD_OUT = 'SOLD_OUT',
}

@Entity('inventory_lots')
@Index(['productId', 'warehouseId'])
@Index(['status', 'entryDate'])
@Index(['expiryDate'])
export class InventoryLot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'integer' })
  @Index()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'warehouse_id', type: 'integer' })
  @Index()
  warehouseId: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.lots)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'lot_number', length: 50 })
  @Index()
  lotNumber: string;

  @Column({ name: 'internal_lot', length: 50, unique: true })
  internalLot: string;

  @Column({
    name: 'initial_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  initialQuantity: number;

  @Column({
    name: 'current_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  currentQuantity: number;

  @Column({
    name: 'reserved_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
  })
  reservedQuantity: number;

  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
  })
  unitCost: number;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 14,
    scale: 4,
    generatedType: 'STORED',
    asExpression: 'current_quantity * unit_cost',
  })
  totalCost: number;


  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  @Index()
  expiryDate: Date;

  @Column({ name: 'entry_date', type: 'timestamp' })
  @Index()
  entryDate: Date;

  @Column({
    type: 'enum',
    enum: LotStatus,
    default: LotStatus.AVAILABLE,
  })
  @Index()
  status: LotStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => InventoryMovement, (movement) => movement.lot)
  movements: InventoryMovement[];
}
