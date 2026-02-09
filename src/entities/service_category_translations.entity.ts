import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ServiceCategory } from './service_categories.entity';

@Entity('service_category_translations')
export class ServiceCategoryTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceCategory, (sc) => sc.translations, {
    onDelete: 'CASCADE',
  })
  serviceCategory: ServiceCategory;

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
