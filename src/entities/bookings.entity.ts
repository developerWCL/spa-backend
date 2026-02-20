import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Customer } from './customers.entity';
import { Branch } from './branch.entity';
import { Package } from './packages.entity';
import { Programme } from './programmes.entity';
import { Bed } from './beds.entity';
import { Promotion } from './promotions.entity';
import { SubService } from './sub_services.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (c) => c.bookings, { onDelete: 'SET NULL' })
  customer: Customer;

  @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
  branch: Branch;

  @ManyToOne(() => SubService, { onDelete: 'SET NULL', nullable: true })
  subService: SubService | null;

  @ManyToOne(() => Package, { onDelete: 'SET NULL', nullable: true })
  package: Package | null;

  @ManyToOne(() => Programme, { onDelete: 'SET NULL', nullable: true })
  programme: Programme | null;

  @ManyToOne(() => Bed, { onDelete: 'SET NULL', nullable: true })
  bed: Bed | null;

  @ManyToOne(() => Promotion, { onDelete: 'SET NULL', nullable: true })
  promotion: Promotion | null;
  @Column({ type: 'timestamp', name: 'booking_time' })
  bookingTime: Date;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'numeric', nullable: true, name: 'total_amount' })
  totalAmount: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
