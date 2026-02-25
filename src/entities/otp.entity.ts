import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Spa } from './spa.entity';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    name: 'used_at',
    type: 'timestamp',
    nullable: true,
  })
  usedAt: Date | null;

  @ManyToOne(() => Spa, (spa) => spa.otps, { nullable: true })
  spa: Spa | null;
}
