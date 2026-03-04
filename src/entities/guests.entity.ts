import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  ManyToMany,
} from 'typeorm';
import { Spa } from './spa.entity';
import { Booking } from './bookings.entity';
import { EntityGuestGender } from './enums/entity-guest.enum';
import { Customer } from './customers.entity';

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spa, (s) => s.guests, { onDelete: 'CASCADE' })
  spa: Spa;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'nationality', nullable: true })
  nationality: string;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: EntityGuestGender,
    default: EntityGuestGender.MALE,
  })
  gender: EntityGuestGender;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ManyToMany(() => Booking, (b) => b.guests)
  bookings: Booking[];

  @ManyToOne(() => Customer, (c) => c.guests, { onDelete: 'SET NULL' })
  customer: Customer | null;
}
