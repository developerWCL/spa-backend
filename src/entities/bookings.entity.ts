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
import { Service } from './services.entity';
import { Package } from './packages.entity';
import { Programme } from './programmes.entity';
import { Bed } from './beds.entity';
import { Promotion } from './promotions.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (c) => c.bookings, { onDelete: 'SET NULL' })
  customer: Customer;

  @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
  branch: Branch;

  @ManyToOne(() => Service, { onDelete: 'SET NULL', nullable: true })
  service: Service | null;

  @ManyToOne(() => Package, { onDelete: 'SET NULL', nullable: true })
  package: Package | null;

  @ManyToOne(() => Programme, { onDelete: 'SET NULL', nullable: true })
  programme: Programme | null;

  @ManyToOne(() => Bed, { onDelete: 'SET NULL', nullable: true })
  bed: Bed | null;

  @ManyToOne(() => Promotion, { onDelete: 'SET NULL', nullable: true })
  promotion: Promotion | null;

  @Column({ type: 'timestamp' })
  booking_time: Date;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'numeric', nullable: true })
  total_amount: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
