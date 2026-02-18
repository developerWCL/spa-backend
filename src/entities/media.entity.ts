import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Service } from './services.entity';
import { Programme } from './programmes.entity';
import { Package } from './packages.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Service, (s) => s.media, { onDelete: 'CASCADE' })
  service: Service;

  @ManyToOne(() => Programme, (p) => p.media, { onDelete: 'CASCADE' })
  programme: Programme;

  @ManyToOne(() => Package, (p) => p.media, { onDelete: 'CASCADE' })
  package: Package;

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
