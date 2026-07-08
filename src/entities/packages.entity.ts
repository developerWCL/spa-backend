import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Branch } from './branch.entity';
import { EntityStatus } from './enums/entity-status.enum';
import { Media } from './media.entity';
import { PackageTranslation } from './package_translation.entity';
import { SubService } from './sub_services.entity';
import { PriceOverride } from './price_overides.entity';
import { PromotionPackage } from './promotion_packages.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'numeric', nullable: true })
  price: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    name: 'status',
  })
  status: EntityStatus;

  @Column({ type: 'int', nullable: true, name: 'display_order', default: 0 })
  displayOrder: number;

  @OneToMany(() => PackageTranslation, (t) => t.package, {
    cascade: true,
    eager: true,
  })
  translations: PackageTranslation[];

  @ManyToMany(() => SubService, { eager: true })
  @JoinTable({
    name: 'package_sub_services',
    joinColumn: { name: 'package_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sub_service_id', referencedColumnName: 'id' },
  })
  subServices: SubService[];

  @OneToMany(() => PriceOverride, (po) => po.package)
  priceOverrides: PriceOverride[];

  @OneToMany(() => PromotionPackage, (pp) => pp.package)
  promotions: PromotionPackage[];

  @ManyToOne(() => Branch, (b) => b.packages, { onDelete: 'CASCADE' })
  branch: Branch;
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Media, (m) => m.package, { cascade: true })
  media: Media[];
}
