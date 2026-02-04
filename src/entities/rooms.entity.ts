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

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.rooms, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column({ name: 'room_number' })
  roomNumber: string;

  @Column({ nullable: true, name: 'room_type' })
  roomType: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => Bed, (b) => b.room)
  beds: Bed[];
}
