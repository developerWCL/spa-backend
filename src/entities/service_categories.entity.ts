import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Service } from './services.entity';
import { Branch } from './branch.entity';
import { ServiceCategoryTranslation } from './service_category_translations.entity';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0, name: 'display_order' })
  displayOrder: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Service, (s) => s.category, { cascade: true })
  services: Service[];

  @OneToMany(() => ServiceCategoryTranslation, (t) => t.serviceCategory, {
    cascade: true,
    eager: true,
  })
  translations: ServiceCategoryTranslation[];

  @ManyToOne(() => Branch, (b) => b.serviceCategories, { onDelete: 'CASCADE' })
  branch: Branch;
}
