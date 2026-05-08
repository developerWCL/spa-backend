import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Promotion } from './promotions.entity';
import { Package } from './packages.entity';

@Entity('promotion_packages')
export class PromotionPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Promotion, (p) => p.packages, { onDelete: 'CASCADE' })
  promotion: Promotion;

  @ManyToOne(() => Package, { onDelete: 'CASCADE' })
  package: Package;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
