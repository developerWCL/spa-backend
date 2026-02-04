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
import { Branch } from './branch.entity';
import { Service } from './services.entity';

@Entity('programmes')
export class Programme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (b) => b.packages, { onDelete: 'CASCADE' })
  branch: Branch;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @ManyToMany(() => Service, (s) => s.programmes)
  @JoinTable({
    name: 'package_services',
    joinColumn: { name: 'programme_id' },
    inverseJoinColumn: { name: 'service_id' },
  })
  services: Service[];
}
