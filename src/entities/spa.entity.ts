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

@Entity('spa')
export class Spa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id', nullable: true })
  companyId?: string;

  @Column({ name: 'company_name', nullable: true })
  companyName?: string;

  @Column({ name: 'billing_email', nullable: true })
  billingEmail?: string;

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

  @Column({ type: 'text', nullable: true })
  @Column({ name: 'api_key', type: 'text', nullable: true })
  apiKey?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Branch, (b) => b.spa)
  branches: Branch[];

  @OneToMany(() => Customer, (c) => c.spa)
  customers: Customer[];
}
