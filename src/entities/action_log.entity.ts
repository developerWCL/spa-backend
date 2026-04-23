import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { Branch } from './branch.entity';

export type ActionType = 'create' | 'update' | 'delete';
export type FeatureType =
  | 'daily'
  | 'booking'
  | 'promotion'
  | 'service'
  | 'programme'
  | 'package'
  | 'staff'
  | 'room'
  | 'bed'
  | 'customer'
  | 'guest';
export type SubFeatureType =
  | 'price'
  | 'staff_dayoff'
  | 'room_closoure'
  | 'booking_item';

@Entity('action_logs')
@Index(['feature', 'actionDate'])
@Index(['actorId'])
@Index(['actionType'])
@Index(['entityType', 'entityId'])
@Index(['branchId'])
export class ActionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp', { name: 'action_date' })
  actionDate: Date;

  @Column({
    type: 'enum',
    enum: [
      'daily',
      'booking',
      'promotion',
      'service',
      'programme',
      'package',
      'staff',
      'room',
      'bed',
      'customer',
      'guest',
    ],
    name: 'feature',
  })
  feature: FeatureType;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'sub_feature',
    nullable: true,
  })
  subFeature: SubFeatureType | null;

  @Column({
    type: 'enum',
    enum: ['create', 'update', 'delete'],
    name: 'action_type',
  })
  actionType: ActionType;

  @Column({
    type: 'uuid',
    name: 'actor_id',
  })
  actorId: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'actor_name',
    nullable: true,
  })
  actorName: string | null;

  @Column({
    type: 'jsonb',
    name: 'new_data',
    nullable: true,
  })
  newData: Record<string, any> | null;

  @Column({
    type: 'jsonb',
    name: 'old_data',
    nullable: true,
  })
  oldData: Record<string, any> | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'entity_type',
    nullable: true,
  })
  entityType: string | null;

  @Column({
    type: 'uuid',
    name: 'entity_id',
    nullable: true,
  })
  entityId: string | null;

  @Column({
    type: 'text',
    name: 'description',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'status',
    default: 'success',
  })
  status: 'success' | 'failure';

  @Column({
    type: 'varchar',
    length: 45,
    name: 'ip_address',
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: true,
  })
  branchId: string | null;

  @ManyToOne(() => Branch, {
    onDelete: 'SET NULL',
    eager: false,
  })
  branch: Branch | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}
