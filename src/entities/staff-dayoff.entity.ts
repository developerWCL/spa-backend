import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from './staffs.entity';

export enum DayOffReason {
  SICK_LEAVE = 'sick_leave',
  PERSONAL = 'personal',
  VACATION = 'vacation',
  MEDICAL_APPOINTMENT = 'medical_appointment',
  FAMILY_EMERGENCY = 'family_emergency',
  OTHER = 'other',
}

@Entity('staff_dayoffs')
export class StaffDayoff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'enum', enum: DayOffReason, default: DayOffReason.OTHER })
  reason: DayOffReason;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
