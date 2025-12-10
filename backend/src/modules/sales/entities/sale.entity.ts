// (removed duplicate minimal definition)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Customer } from './customer.entity';
import { CashRegister } from './cash-register.entity';
import { CashRegisterSession } from './cash-register-session.entity';
import { User } from '../../users/entities/user.entity';
import { SaleItem } from './sale-item.entity';
import { SalePayment } from './sale-payment.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ name: 'company_id', nullable: true })
  companyId?: number;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch?: Branch;

  @Column({ name: 'branch_id', nullable: true })
  branchId?: number;

  @Column({ name: 'sale_number', length: 50, unique: true })
  saleNumber: string;

  @Column({ name: 'ticket_number', length: 50, nullable: true })
  ticketNumber?: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId?: string;

  @ManyToOne(() => CashRegister, { nullable: true })
  @JoinColumn({ name: 'cash_register_id' })
  cashRegister?: CashRegister;

  @Column({ name: 'cash_register_id', type: 'uuid', nullable: true })
  cashRegisterId?: string;

  @ManyToOne(() => CashRegisterSession, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session?: CashRegisterSession;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId?: string;

  @Column({ name: 'sale_date', type: 'timestamp', default: () => 'NOW()' })
  saleDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: string;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount: string;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discountAmount: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmount: string;

  @Column({ name: 'sale_type', length: 20, default: 'RETAIL' })
  saleType: string;

  @Column({ length: 20, default: 'COMPLETED' })
  status: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cashier_id' })
  cashier?: User;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => SaleItem, (item: SaleItem) => item.sale, { cascade: true })
  items: SaleItem[];

  @OneToMany(() => SalePayment, (payment: SalePayment) => payment.sale, {
    cascade: true,
  })
  payments: SalePayment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
