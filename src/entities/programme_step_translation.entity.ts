import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { ProgrammeStep } from './programmes_step.entity';

@Entity('programme_step_translations')
export class ProgrammeStepTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProgrammeStep, (ps) => ps.translations, {
    onDelete: 'CASCADE',
  })
  programmeStep: ProgrammeStep;

  @Column({ length: 10 })
  languageCode: string; // 'en', 'th', etc.

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
