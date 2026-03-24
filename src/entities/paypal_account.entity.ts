import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Spa } from './spa.entity';
import { Branch } from './branch.entity';
import { PaypalMode } from './enums/paypal.enum';

@Entity('paypal_accounts')
export class PaypalAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spa, { onDelete: 'CASCADE' })
  spa: Spa;

  @Column()
  label: string;

  @Column({ name: 'client_id', type: 'text' })
  clientId: string;

  @Column({ name: 'client_secret', type: 'text' })
  clientSecret: string;

  @Column({ name: 'webhook_id', nullable: true })
  webhookId: string | null;

  @Column({
    type: 'enum',
    enum: PaypalMode,
    default: PaypalMode.SANDBOX,
  })
  mode: PaypalMode;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany(() => Branch)
  @JoinTable({
    name: 'paypal_account_branches',
    joinColumn: { name: 'paypal_account_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'branch_id', referencedColumnName: 'id' },
  })
  branches: Branch[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
