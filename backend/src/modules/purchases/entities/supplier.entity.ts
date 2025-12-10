import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32 })
  code: string;

  @Column({ name: 'business_name', length: 128 })
  businessName: string;

  @Column({ name: 'trade_name', type: 'varchar', length: 128, nullable: true })
  tradeName?: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  rfc?: string | null;

  @Column({ name: 'contact_name', type: 'varchar', length: 128, nullable: true })
  contactName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mobile?: string | null;

  @Column({ type: 'varchar', nullable: true })
  street?: string | null;

  @Column({ type: 'varchar', nullable: true })
  city?: string | null;

  @Column({ type: 'varchar', nullable: true })
  state?: string | null;

  @Column({ name: 'postal_code', type: 'varchar', nullable: true })
  postalCode?: string | null;

  @Column({ name: 'payment_terms', type: 'varchar', length: 64, nullable: true })
  paymentTerms?: string | null;

  @Column({ name: 'credit_limit', type: 'numeric', precision: 14, scale: 2, default: 0 })
  creditLimit: string;

  @Column({ name: 'credit_days', type: 'int', default: 0 })
  creditDays: number;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'current_debt', type: 'numeric', precision: 14, scale: 2, default: 0 })
  currentDebt: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}