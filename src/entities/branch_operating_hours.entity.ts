import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('branch_operating_hours')
export class BranchOperatingHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.operatingHours, { onDelete: 'CASCADE' })
  branch: Branch;
  @Column('int', { name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ type: 'time', name: 'open_time' })
  openTime: string;

  @Column({ type: 'time', name: 'close_time' })
  closeTime: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
