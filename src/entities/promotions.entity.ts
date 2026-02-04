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

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({ type: 'numeric', nullable: true, name: 'discount_percent' })
  discountPercent: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @Column({ type: 'int', nullable: true, name: 'max_used' })
  maxUsed: number;

  @Column({ type: 'int', default: 0 })
  used: number;

  @ManyToOne(() => Branch, (b) => b.promotions, { onDelete: 'CASCADE' })
  branch: Branch;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
