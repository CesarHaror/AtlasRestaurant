import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../menu/entities/menu-item.entity';
import { Warehouse } from './warehouse.entity';
import { InventoryLot } from './inventory-lot.entity';
import { User } from '../../users/entities/user.entity';

export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  WASTE = 'WASTE',
  INITIAL = 'INITIAL',
}

@Entity('inventory_movements')
@Index(['productId', 'movementDate'])
@Index(['warehouseId', 'movementDate'])
@Index(['movementType'])
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'movement_type',
    type: 'enum',
    enum: MovementType,
  })
  @Index()
  movementType: MovementType;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'integer', nullable: true })
  @Index()
  referenceId: number;

  @Column({ name: 'product_id', type: 'integer' })
  @Index()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'lot_id', type: 'uuid', nullable: true })
  lotId: string;

  @ManyToOne(() => InventoryLot, (lot) => lot.movements, { nullable: true })
  @JoinColumn({ name: 'lot_id' })
  lot: InventoryLot;

  @Column({ name: 'warehouse_id', type: 'integer' })
  @Index()
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    comment: 'Positivo para entrada, negativo para salida',
  })
  quantity: number;

  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
  })
  unitCost: number;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 14,
    scale: 4,
    nullable: true,
  })
  totalCost: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'movement_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  movementDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
