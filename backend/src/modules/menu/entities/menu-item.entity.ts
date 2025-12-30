import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { MenuCategory } from './menu-category.entity';
import { UnitOfMeasure } from './unit-of-measure.entity';

@Entity('products')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'company_id' })
  restaurant?: Restaurant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  sku?: string;

  @Column({ length: 50, nullable: true })
  barcode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'category_id', nullable: true })
  categoryId?: number;

  @ManyToOne(() => MenuCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: MenuCategory;

  @Column({ name: 'unit_of_measure_id', nullable: true })
  unitOfMeasureId?: number;

  @ManyToOne(() => UnitOfMeasure, { nullable: true })
  @JoinColumn({ name: 'unit_of_measure_id' })
  unitOfMeasure?: UnitOfMeasure;

  @Column({ name: 'is_variable_weight', default: false })
  isVariableWeight: boolean;

  @Column({ name: 'product_type', length: 50, default: 'SIMPLE' })
  productType: string;

  @Column({ name: 'track_inventory', default: true })
  trackInventory: boolean;

  @Column({ name: 'track_lots', default: false })
  trackLots: boolean;

  @Column({ name: 'track_expiry', default: false })
  trackExpiry: boolean;

  @Column({ name: 'min_stock_alert', type: 'decimal', precision: 10, scale: 3, nullable: true })
  minStockAlert?: string;

  @Column({ name: 'max_stock', type: 'decimal', precision: 10, scale: 3, nullable: true })
  maxStock?: string;

  @Column({ name: 'requires_refrigeration', default: false })
  requiresRefrigeration: boolean;

  @Column({ name: 'min_temperature', type: 'decimal', precision: 5, scale: 2, nullable: true })
  minTemperature?: string;

  @Column({ name: 'max_temperature', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxTemperature?: string;

  @Column({ name: 'standard_cost', type: 'decimal', precision: 12, scale: 4, nullable: true })
  standardCost?: string;

  @Column({ name: 'primary_supplier_id', nullable: true })
  primarySupplierId?: number;

  @Column({ name: 'sat_product_key', length: 10, nullable: true })
  satProductKey?: string;

  @Column({ name: 'sat_unit_key', length: 10, nullable: true })
  satUnitKey?: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  @Column({ name: 'show_in_pos', default: true })
  showInPos: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
