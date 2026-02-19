import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Bed } from './beds.entity';
import { RoomStatus } from './enums/entity-room.enum';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.rooms, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column({ name: 'name' })
  name: string;

  @Column({ nullable: true, name: 'type' })
  type: string;

  @Column({ nullable: true, name: 'capacity' })
  capacity: number;

  @Column({ nullable: true, name: 'floor' })
  floor: string;

  @Column({ nullable: true, name: 'size' })
  size: string;

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

  @OneToMany(() => Bed, (b) => b.room)
  beds: Bed[];
}
