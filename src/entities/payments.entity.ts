import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Booking } from './bookings.entity';
import { PaymentStatus, PaymentType } from './enums/booking.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  booking: Booking;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    nullable: true,
    name: 'payment_type',
  })
  paymentType: PaymentType | null;

  @Column({ type: 'numeric' })
  amount: string;

  @Column({ name: 'paypal_order_id', nullable: true })
  paypalOrderId: string | null;

  @Column({ name: 'paypal_capture_id', nullable: true })
  paypalCaptureId: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
