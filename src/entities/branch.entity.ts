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
import { Spa } from './spa.entity';
import { BranchOperatingHours } from './branch_operating_hours.entity';
import { BranchSpecialClosures } from './branch_special_closures.entity';
import { Staff } from './staffs.entity';
import { Room } from './rooms.entity';
import { Service } from './services.entity';
import { Package } from './packages.entity';
import { Promotion } from './promotions.entity';
import { ServiceCategory } from './service_categories.entity';
import { Bed } from './beds.entity';

@Entity('branch')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Spa, (s) => s.branches, { onDelete: 'CASCADE' })
  spa: Spa;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => BranchOperatingHours, (h) => h.branch)
  operatingHours: BranchOperatingHours[];

  @OneToMany(() => BranchSpecialClosures, (c) => c.branch)
  special_closures: BranchSpecialClosures[];

  @OneToMany(() => Staff, (s) => s.branches)
  staffs: Staff[];

  @OneToMany(() => Room, (r) => r.branch)
  rooms: Room[];

  @OneToMany(() => Bed, (b) => b.branch)
  beds: Bed[];

  @OneToMany(() => Service, (svc) => svc.branch)
  services: Service[];

  @OneToMany(() => Package, (p) => p.branch)
  packages: Package[];

  @OneToMany(() => Promotion, (pr) => pr.branch)
  promotions: Promotion[];

  @OneToMany(() => ServiceCategory, (sc) => sc.branch)
  serviceCategories: ServiceCategory[];
}
