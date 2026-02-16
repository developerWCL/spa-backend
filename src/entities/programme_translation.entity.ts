import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Programme } from './programmes.entity';

@Entity('programme_translations')
export class ProgrammeTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Programme, (p) => p.translations, {
    onDelete: 'CASCADE',
  })
  programme: Programme;

  @Column({ length: 10 })
  languageCode: string; // 'en', 'th', etc.

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
