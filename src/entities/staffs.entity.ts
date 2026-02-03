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

@Entity('staffs')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.staffs, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
