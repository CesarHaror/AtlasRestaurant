import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (c) => c.branches, { onDelete: 'CASCADE' })
  company: Company;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Inventory, (i) => i.branch)
  inventory?: Inventory[];
}
