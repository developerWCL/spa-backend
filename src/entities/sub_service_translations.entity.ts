import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { SubService } from './sub_services.entity';

@Entity('sub_service_translations')
export class SubServiceTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SubService, (ss) => ss.translations, {
    onDelete: 'CASCADE',
  })
  subService: SubService;

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
}
