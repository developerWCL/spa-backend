import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubService } from './sub_services.entity';
import { Package } from './packages.entity';
import { Programme } from './programmes.entity';

@Entity('price_overides')
export class PriceOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'override_start_date', type: 'timestamp' })
  overrideStartDate: Date;

  @Column({ name: 'override_end_date', type: 'timestamp', nullable: true })
  overrideEndDate?: Date;

  @Column({ name: 'price' })
  price: number;

  @ManyToOne(() => SubService, (subService) => subService.priceOverrides, {
    onDelete: 'SET NULL',
  })
  subService: SubService | null;

  @ManyToOne(() => Package, (pkg) => pkg.priceOverrides, {
    onDelete: 'SET NULL',
  })
  package: Package | null;

  @ManyToOne(() => Programme, (programme) => programme.priceOverrides, {
    onDelete: 'SET NULL',
  })
  programme: Programme | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
