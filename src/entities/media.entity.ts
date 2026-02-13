import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Service } from './services.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Service, (s) => s.media, { onDelete: 'CASCADE' })
  service: Service;

  @Column()
  filename: string;

  @Column()
  type: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  url: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
