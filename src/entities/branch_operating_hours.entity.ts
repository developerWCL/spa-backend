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

  @ManyToOne(() => Branch, (b) => b.operating_hours, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column('int')
  day_of_week: number;

  @Column({ type: 'time' })
  open_time: string;

  @Column({ type: 'time' })
  close_time: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
