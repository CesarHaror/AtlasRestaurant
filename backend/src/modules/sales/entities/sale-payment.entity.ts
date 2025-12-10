import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_payments')
export class SalePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ name: 'payment_method', length: 20 })
  paymentMethod: string;

  @Column({ name: 'payment_reference', length: 100, nullable: true })
  paymentReference?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ name: 'card_last_digits', length: 4, nullable: true })
  cardLastDigits?: string;

  @Column({ name: 'card_type', length: 20, nullable: true })
  cardType?: string;

  @Column({
    name: 'payment_date',
    type: 'timestamp',
    default: () => 'NOW()',
  })
  paymentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
