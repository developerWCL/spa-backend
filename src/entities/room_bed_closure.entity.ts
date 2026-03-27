import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './rooms.entity';
import { Bed } from './beds.entity';

@Entity('room_bed_closure')
export class RoomBedClosure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, (room) => room.closure, { onDelete: 'CASCADE' })
  room: Room;

  @ManyToOne(() => Bed, (bed) => bed.closure, { onDelete: 'CASCADE' })
  bed: Bed;

  @Column({ name: 'closure_date', type: 'timestamp' })
  closureDate: Date;

  @Column({ nullable: true, name: 'reason' })
  reason: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;
}
