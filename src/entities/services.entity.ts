import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Programme } from './programmes.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.services, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', nullable: true })
  base_price: string;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @ManyToMany(() => Programme, (p) => p.services)
  programmes: Programme[];
}
