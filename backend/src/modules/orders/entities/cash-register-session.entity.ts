import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CashRegister } from './cash-register.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cash_register_sessions')
export class CashRegisterSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CashRegister)
  @JoinColumn({ name: 'cash_register_id' })
  cashRegister: CashRegister;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'closed_by', type: 'uuid', nullable: true })
  closedBy?: string;

  @Column({ name: 'opened_at', type: 'timestamp', default: () => 'NOW()' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({
    name: 'opening_cash',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  openingCash: string;

  @Column({
    name: 'expected_cash',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  expectedCash: string;

  @Column({
    name: 'actual_cash',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  actualCash?: string;

  @Column({
    name: 'cash_difference',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  cashDifference: string;

  @Column({
    name: 'card_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  cardTotal: string;

  @Column({
    name: 'transfer_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  transferTotal: string;

  @Column({
    name: 'total_sales',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalSales: string;

  @Column({ length: 20, default: 'OPEN' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
