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
import { Programme } from './programmes.entity';
import { ProgrammeStepTranslation } from './programme_step_translation.entity';

@Entity('programmes_steps')
export class ProgrammeStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Programme, (p) => p.steps, { onDelete: 'CASCADE' })
  programme: Programme;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true, name: 'duration' })
  duration: number;

  @OneToMany(() => ProgrammeStepTranslation, (t) => t.programmeStep, {
    cascade: true,
    eager: true,
  })
  translations: ProgrammeStepTranslation[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
