import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Promotion } from './promotions.entity';
import { Programme } from './programmes.entity';

@Entity('promotion_programmes')
export class PromotionProgramme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Promotion, (p) => p.programmes, { onDelete: 'CASCADE' })
  promotion: Promotion;

  @ManyToOne(() => Programme, { onDelete: 'CASCADE' })
  programme: Programme;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
