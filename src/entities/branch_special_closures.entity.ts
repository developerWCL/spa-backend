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

@Entity('branch_special_closures')
export class BranchSpecialClosures {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.special_closures, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column({ type: 'date' })
  specific_date: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ default: true })
  is_all_day: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
