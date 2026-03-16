import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Booking } from './bookings.entity';
import { SubService } from './sub_services.entity';
import { Package } from './packages.entity';
import { Programme } from './programmes.entity';
import { Bed } from './beds.entity';
import { CartItemType } from './enums/cart.enum';
import { Guest } from './guests.entity';
import { Room } from './rooms.entity';
import { Staff } from './staffs.entity';

@Entity('booking_items')
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  booking: Booking;

  @ManyToOne(() => SubService, { onDelete: 'SET NULL', nullable: true })
  subService: SubService | null;

  @ManyToOne(() => Package, { onDelete: 'SET NULL', nullable: true })
  package: Package | null;

  @ManyToOne(() => Programme, { onDelete: 'SET NULL', nullable: true })
  programme: Programme | null;

  @ManyToOne(() => Bed, { onDelete: 'SET NULL', nullable: true })
  bed: Bed | null;

  @ManyToOne(() => Room, { onDelete: 'SET NULL', nullable: true })
  room: Room | null;

  @ManyToOne(() => Staff, { onDelete: 'SET NULL', nullable: true })
  staff: Staff | null;

  @ManyToMany(() => Guest, (g) => g.bookingItems)
  @JoinTable({ name: 'booking_items_guests' })
  guests: Guest[];

  @Column({
    type: 'enum',
    enum: CartItemType,
  })
  itemType: CartItemType;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'numeric', nullable: true })
  price: string;

  @Column({ type: 'numeric', nullable: true, name: 'subtotal' })
  subtotal: string;

  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_date' })
  scheduledDate: Date;

  @Column({ type: 'time', nullable: true, name: 'scheduled_time' })
  scheduledTime: string;

  @Column({ name: 'duration', type: 'int' })
  duration: number;

  @Column({ nullable: true, name: 'notes' })
  notes: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
