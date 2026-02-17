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
import { ProgrammeStep } from './programmes_step.entity';
import { ProgrammeTranslation } from './programme_translation.entity';
import { Media } from './media.entity';
import { EntityStatus } from './enums/entity-status.enum';

@Entity('programmes')
export class Programme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.packages, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', nullable: true, name: 'price' })
  price: string;

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

  @OneToMany(() => ProgrammeStep, (ps) => ps.programme, { cascade: true })
  steps: ProgrammeStep[];

  @OneToMany(() => ProgrammeTranslation, (t) => t.programme, {
    cascade: true,
    eager: true,
  })
  translations: ProgrammeTranslation[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Media, (m) => m.programme, { cascade: true })
  media: Media[];
}
