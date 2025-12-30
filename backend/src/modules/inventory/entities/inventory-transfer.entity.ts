import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Warehouse } from './warehouse.entity';
import { InventoryLot } from './inventory-lot.entity';

@Entity('inventory_transfers')
@Index(['sourceWarehouseId', 'destinationWarehouseId'])
@Index(['productId'])
@Index(['createdAt'])
export class InventoryTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'source_warehouse_id' })
  sourceWarehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'source_warehouse_id' })
  sourceWarehouse: Warehouse;

  @Column({ name: 'destination_warehouse_id' })
  destinationWarehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'destination_warehouse_id' })
  destinationWarehouse: Warehouse;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'product_id' })
  product: MenuItem;

  @Column({ name: 'lot_id' })
  lotId: number;

  @ManyToOne(() => InventoryLot)
  @JoinColumn({ name: 'lot_id' })
  lot: InventoryLot;

  @Column('decimal', { precision: 12, scale: 4 })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
