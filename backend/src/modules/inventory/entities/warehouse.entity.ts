import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { InventoryLot } from './inventory-lot.entity';

export enum WarehouseType {
  COLD_STORAGE = 'COLD_STORAGE',
  DRY_STORAGE = 'DRY_STORAGE',
  DISPLAY = 'DISPLAY',
  FREEZER = 'FREEZER',
}

@Entity('warehouses')
@Index(['branchId', 'isActive'])
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id', type: 'integer' })
  @Index()
  branchId: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    name: 'warehouse_type',
    type: 'enum',
    enum: WarehouseType,
  })
  warehouseType: WarehouseType;

  @Column({ name: 'has_temperature_control', default: false })
  hasTemperatureControl: boolean;

  @Column({
    name: 'target_temperature',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  targetTemperature: number;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relaciones
  @OneToMany(() => InventoryLot, (lot) => lot.warehouse)
  lots: InventoryLot[];
}
