import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Role } from './role.entity';
import { BookingItem } from './booking_items.entity';

@Entity('staffs')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Branch, (b) => b.staffs, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'staff_branches' })
  branches: Branch[];

  @OneToMany(() => BookingItem, (b) => b.staff)
  bookingItems: BookingItem[];

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'specialties', nullable: true })
  specialties: string;

  @Column({ name: 'working_hours', nullable: true })
  workingHours: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'timestamp' })
  passwordResetExpires?: Date;

  @ManyToMany(() => Role, (r) => r.staffs, { cascade: true })
  @JoinTable({ name: 'staff_roles' })
  roles?: Role[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
