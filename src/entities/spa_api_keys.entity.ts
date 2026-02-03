import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Spa } from './spa.entity';

@Entity('spa_api_keys')
export class SpaApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spa, (s) => s.apiKeys, { onDelete: 'CASCADE' })
  spa: Spa;

  @Column('text')
  key_hash: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
