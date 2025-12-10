import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', length: 255, unique: true })
  @Index()
  email: string;

  // Map to existing DB column `password`
  @Column({ name: 'password', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'username', length: 100, nullable: true, unique: true })
  username: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Convenience getter
  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId?: string;

  @ManyToOne('Role', 'users', { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role?: any;

  @Column({ name: 'branch_id', type: 'integer', nullable: true })
  @Index()
  branchId?: number;

  @ManyToOne('Branch', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: any;
}
