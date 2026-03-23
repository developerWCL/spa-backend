import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Customer } from './customers.entity';
import { Branch } from './branch.entity';
import { Promotion } from './promotions.entity';
import { BookingItem } from './booking_items.entity';
import { BookingStatus } from './enums/booking.enum';
import { Payment } from './payments.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', unique: true })
  bookingId: string;

  @ManyToOne(() => Customer, (c) => c.bookings, { onDelete: 'SET NULL' })
  customer: Customer;

  @ManyToOne(() => Branch, { onDelete: 'SET NULL' })
  branch: Branch;

  @ManyToOne(() => Promotion, { onDelete: 'SET NULL', nullable: true })
  promotion: Promotion | null;

  @OneToMany(() => BookingItem, (item) => item.booking, { cascade: true })
  items: BookingItem[];

  @Column({ type: 'timestamp', name: 'booking_time' })
  bookingTime: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'numeric', nullable: true, name: 'total_amount' })
  totalAmount: string;

  @Column({ type: 'numeric', nullable: true, name: 'amount' })
  amount: string;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'discount_amount',
  })
  discountAmount: string;

  @Column({ type: 'int', default: 0, name: 'items_count' })
  itemsCount: number;

  @Column({ nullable: true, name: 'notes' })
  notes: string;

  @OneToMany(() => Payment, (item) => item.booking, { cascade: true })
  payments: Payment[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
