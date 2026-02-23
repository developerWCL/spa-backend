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
import {
  PromotionActiveDay,
  PromotionDiscountType,
} from './enums/entity-promotion.enum';
import { EntityStatus } from './enums/entity-status.enum';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PromotionDiscountType, name: 'discount_type' })
  discountType: PromotionDiscountType;

  @Column({ type: 'numeric', nullable: true, name: 'discount_value' })
  discountValue: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @Column({ type: 'numeric', nullable: true, name: 'min_purchase_amount' })
  minPurchaseAmount: string;

  @Column({ type: 'int', nullable: true, name: 'max_used' })
  maxUsed: number;

  @Column({ type: 'int', default: 0 })
  used: number;

  @Column({ type: 'text', array: true, nullable: true, name: 'active_days' })
  activeDays: PromotionActiveDay[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @ManyToOne(() => Branch, (b) => b.promotions, { onDelete: 'CASCADE' })
  branch: Branch;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
