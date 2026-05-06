import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Promotion } from './promotions.entity';
import { Service } from './services.entity';

@Entity('promotion_services')
export class PromotionService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Promotion, (p) => p.services, { onDelete: 'CASCADE' })
  promotion: Promotion;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  service: Service;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
