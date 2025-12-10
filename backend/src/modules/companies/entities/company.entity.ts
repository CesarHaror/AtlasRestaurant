import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_name', length: 255 })
  businessName: string;

  @Column({ name: 'trade_name', length: 255, nullable: true })
  tradeName?: string;

  @Column({ length: 13, nullable: true })
  rfc?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ name: 'postal_code', length: 10, nullable: true })
  postalCode?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'tax_regime', length: 20, nullable: true })
  taxRegime?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Branch, (b) => b.company)
  branches?: Branch[];
}
