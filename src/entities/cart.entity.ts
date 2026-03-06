import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Customer } from './customers.entity';
import { CartItem } from './cart_items.entity';
import { CartStatus } from './enums/cart.enum';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE', nullable: false })
  customer: Customer;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @Column({ type: 'numeric', nullable: true, name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'int', default: 0, name: 'items_count' })
  itemsCount: number;

  @Column({ nullable: true, name: 'notes' })
  notes: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
