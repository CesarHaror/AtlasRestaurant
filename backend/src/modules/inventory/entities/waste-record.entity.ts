import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { InventoryLot } from './inventory-lot.entity';
import { User } from '../../users/entities/user.entity';

export enum WasteType {
  EXPIRY = 'EXPIRY',
  DAMAGE = 'DAMAGE',
  THEFT = 'THEFT',
  TEMPERATURE = 'TEMPERATURE',
  QUALITY = 'QUALITY',
  OTHER = 'OTHER',
}

@Entity('waste_records')
@Index(['warehouseId', 'wasteDate'])
@Index(['wasteType'])
export class WasteRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'warehouse_id', type: 'integer' })
  @Index()
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'lot_id', type: 'uuid', nullable: true })
  lotId: string;

  @ManyToOne(() => InventoryLot, { nullable: true })
  @JoinColumn({ name: 'lot_id' })
  lot: InventoryLot;

  @Column({
    name: 'waste_type',
    type: 'enum',
    enum: WasteType,
  })
  wasteType: WasteType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
  })
  quantity: number;

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
  })
  totalCost: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'responsible_user_id', type: 'uuid', nullable: true })
  responsibleUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'responsible_user_id' })
  responsibleUser: User;

  @Column({
    name: 'waste_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  wasteDate: Date;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
