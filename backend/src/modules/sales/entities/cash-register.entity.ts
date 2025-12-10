// (removed duplicate minimal definition)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cash_registers')
export class CashRegister {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id', nullable: true })
  branchId?: number;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'device_identifier', length: 100, nullable: true })
  deviceIdentifier?: string;

  @Column({ name: 'has_scale', default: false })
  hasScale: boolean;

  @Column({ name: 'scale_port', length: 50, nullable: true })
  scalePort?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
