import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Room } from './rooms.entity';
import { BedType, RoomStatus } from './enums/entity-room.enum';
import { Branch } from './branch.entity';

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, (r) => r.beds, { onDelete: 'CASCADE' })
  room?: Room;

  @ManyToOne(() => Branch, (b) => b.beds, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column({ name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'bed_id' })
  bedId: string;

  @Column({ nullable: true, name: 'type', default: BedType.BED, enum: BedType })
  type: BedType;

  @Column({
    nullable: true,
    name: 'status',
    default: RoomStatus.AVAILABLE,
    enum: RoomStatus,
  })
  status: RoomStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
