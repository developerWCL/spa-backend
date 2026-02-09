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
import { Service } from './services.entity';
import { SubServiceTranslation } from './sub_service_translations.entity';
import { EntityStatus } from './enums/entity-status.enum';

@Entity('sub_services')
export class SubService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Service, (s) => s.subServices, { onDelete: 'CASCADE' })
  service: Service;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true, name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'numeric', nullable: true })
  price: string;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    name: 'status',
  })
  status: EntityStatus;

  @OneToMany(() => SubServiceTranslation, (t) => t.subService, {
    cascade: true,
    eager: true,
  })
  translations: SubServiceTranslation[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
