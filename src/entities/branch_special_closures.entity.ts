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
  @Column({ type: 'date', name: 'specific_date' })
  specificDate: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ default: true, name: 'is_all_day' })
  isAllDay: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
