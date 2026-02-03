import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Spa } from './spa.entity';
import { Booking } from './bookings.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spa, (s) => s.customers, { onDelete: 'CASCADE' })
  spa: Spa;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'int', default: 0 })
  loyalty_points: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => Booking, (b) => b.customer)
  bookings: Booking[];
}
