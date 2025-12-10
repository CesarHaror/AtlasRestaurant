import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('units_of_measure')
export class UnitOfMeasure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ length: 20, nullable: true })
  abbreviation?: string;

  @Column({ name: 'is_weight', default: false })
  isWeight: boolean;

  @Column({ name: 'conversion_factor', type: 'decimal', nullable: true })
  conversionFactor?: string;

  @Column({ name: 'sat_code', length: 50, nullable: true })
  satCode?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
