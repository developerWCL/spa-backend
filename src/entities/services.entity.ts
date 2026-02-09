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
} from 'typeorm';
import { Branch } from './branch.entity';
import { Programme } from './programmes.entity';
import { ServiceCategory } from './service_categories.entity';
import { SubService } from './sub_services.entity';
import { ServiceTranslation } from './service_translations.entity';
import { EntityStatus } from './enums/entity-status.enum';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.services, { onDelete: 'CASCADE' })
  branch: Branch;

  @ManyToOne(() => ServiceCategory, (sc) => sc.services, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: ServiceCategory;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'numeric', nullable: true, name: 'base_price' })
  basePrice: string;

  @Column({ type: 'int', nullable: true, name: 'duration_minutes' })
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    name: 'status',
  })
  status: EntityStatus;

  @Column({
    type: 'int',
    nullable: true,
    name: 'max_concurrent_bookings',
    default: 0,
  })
  maxConcurrentBookings: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'max_bookings_per_day',
    default: 0,
  })
  maxBookingsPerDay: number;

  @OneToMany(() => SubService, (ss) => ss.service, { cascade: true })
  subServices: SubService[];

  @OneToMany(() => ServiceTranslation, (t) => t.service, {
    cascade: true,
    eager: true,
  })
  translations: ServiceTranslation[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToMany(() => Programme, (p) => p.services)
  programmes: Programme[];
}
