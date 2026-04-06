import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('paypal_pending_orders')
export class PaypalPendingOrder {
  @PrimaryColumn({ name: 'paypal_order_id' })
  paypalOrderId: string;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column({ type: 'jsonb', name: 'booking_payload' })
  bookingPayload: Record<string, any>;

  @Column({ type: 'jsonb', name: 'booking_items', nullable: true })
  bookingItems: Record<string, any>[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
