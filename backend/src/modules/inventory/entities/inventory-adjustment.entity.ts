import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { AdjustmentItem } from './adjustment-item.entity';

export enum AdjustmentStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
}

export enum AdjustmentType {
  PHYSICAL_COUNT = 'PHYSICAL_COUNT',
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
  CORRECTION = 'CORRECTION',
}

@Entity('inventory_adjustments')
@Index(['warehouseId', 'adjustmentDate'])
@Index(['status'])
export class InventoryAdjustment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'warehouse_id', type: 'integer' })
  @Index()
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({
    name: 'adjustment_type',
    type: 'enum',
    enum: AdjustmentType,
  })
  adjustmentType: AdjustmentType;

  @Column({
    type: 'enum',
    enum: AdjustmentStatus,
    default: AdjustmentStatus.DRAFT,
  })
  @Index()
  status: AdjustmentStatus;

  @Column({ name: 'created_by', type: 'integer', nullable: true })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'approved_by', type: 'integer', nullable: true })
  approvedBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'applied_by', type: 'integer', nullable: true })
  appliedBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'applied_by' })
  applier: User;

  @Column({
    name: 'adjustment_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  adjustmentDate: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'applied_at', type: 'timestamp', nullable: true })
  appliedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AdjustmentItem, (item) => item.adjustment, { cascade: true })
  items: AdjustmentItem[];
}
