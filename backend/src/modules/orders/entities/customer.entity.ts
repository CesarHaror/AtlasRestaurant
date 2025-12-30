import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/company.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Restaurant, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Restaurant;

  @Column({
    name: 'customer_type',
    type: 'varchar',
    length: 20,
    default: 'RETAIL',
  })
  customerType: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'business_name', length: 255, nullable: true })
  businessName?: string;

  @Column({ length: 50, nullable: true })
  rfc?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({
    name: 'credit_limit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  creditLimit: string;

  @Column({
    name: 'current_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentBalance: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Computed property
  get fullName(): string {
    if (this.businessName) return this.businessName;
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }
}
