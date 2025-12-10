import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: true })
  company?: Company;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({ name: 'business_name', length: 255 })
  businessName: string;

  @Column({ name: 'trade_name', length: 255, nullable: true })
  tradeName?: string;

  @Column({ length: 50, nullable: true })
  rfc?: string;

  @Column({ name: 'contact_name', length: 255, nullable: true })
  contactName?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({ length: 50, nullable: true })
  mobile?: string;

  @Column({ type: 'text', nullable: true })
  street?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  @Column({ name: 'payment_terms', length: 255, nullable: true })
  paymentTerms?: string;

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

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
