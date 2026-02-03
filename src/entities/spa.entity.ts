import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Customer } from './customers.entity';
import { SpaApiKey } from './spa_api_keys.entity';

@Entity('spa')
export class Spa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  company_id?: string;

  @Column({ nullable: true })
  company_name?: string;

  @Column({ nullable: true })
  billing_email?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => Branch, (b) => b.spa)
  branches: Branch[];

  @OneToMany(() => Customer, (c) => c.spa)
  customers: Customer[];

  @OneToMany(() => SpaApiKey, (k) => k.spa)
  apiKeys: SpaApiKey[];
}
