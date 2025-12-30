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
import { Restaurant } from '../../restaurants/entities/company.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Customer } from './customer.entity';
import { CashRegister } from './cash-register.entity';
import { CashRegisterSession } from './cash-register-session.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderPayment } from './order-payment.entity';

@Entity('sales')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Restaurant, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Restaurant;

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

  @OneToMany(() => OrderItem, (item: OrderItem) => item.sale, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderPayment, (payment: OrderPayment) => payment.sale, {
    cascade: true,
  })
  payments: OrderPayment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
