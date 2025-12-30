import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  product: MenuItem;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'reorder_level', type: 'int', default: 10 })
  reorderLevel: number;

  @Column({
    name: 'last_updated',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastUpdated: Date;
}
