import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Booking } from './bookings.entity';
import {
  PromotionActiveDay,
  PromotionDayActivated,
  PromotionDiscountType,
  PromotionGuestType,
} from './enums/entity-promotion.enum';
import { EntityStatus } from './enums/entity-status.enum';
import { Media } from './media.entity';
import { PromotionService } from './promotion_services.entity';
import { PromotionPackage } from './promotion_packages.entity';
import { PromotionProgramme } from './promotion_programmes.entity';

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

  @Column({ type: 'int', nullable: true, name: 'max_used_per_account' })
  maxUsedPerAccount: number;

  @Column({ type: 'text', array: true, nullable: true, name: 'active_days' })
  activeDays: PromotionActiveDay[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Column({
    name: 'auto_apply',
    type: 'boolean',
    default: false,
  })
  autoApply: boolean;

  @Column({
    name: 'day_activated',
    type: 'enum',
    enum: PromotionDayActivated,
    default: PromotionDayActivated.BOOKING_DAY,
  })
  dayActivated: PromotionDayActivated;

  @Column({
    name: 'guest_type',
    type: 'enum',
    enum: PromotionGuestType,
    default: PromotionGuestType.ALL_GUESTS,
  })
  guestType: PromotionGuestType;

  @ManyToOne(() => Branch, (b) => b.promotions, { onDelete: 'CASCADE' })
  branch: Branch;

  @OneToMany(() => Media, (media) => media.promotion)
  media: Media[];

  @OneToMany(() => PromotionService, (ps) => ps.promotion, {
    cascade: true,
    eager: true,
  })
  services: PromotionService[];

  @OneToMany(() => PromotionPackage, (pp) => pp.promotion, {
    cascade: true,
    eager: true,
  })
  packages: PromotionPackage[];

  @OneToMany(() => PromotionProgramme, (pprog) => pprog.promotion, {
    cascade: true,
    eager: true,
  })
  programmes: PromotionProgramme[];

  @OneToMany(() => Booking, (booking) => booking.promotion)
  bookings: Booking[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
