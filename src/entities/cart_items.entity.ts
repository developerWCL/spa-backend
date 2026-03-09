import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Cart } from './cart.entity';
import { SubService } from './sub_services.entity';
import { Package } from './packages.entity';
import { Programme } from './programmes.entity';
import { CartItemType } from './enums/cart.enum';
import { Guest } from './guests.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  cart: Cart;

  @ManyToOne(() => SubService, { onDelete: 'SET NULL', nullable: true })
  subService: SubService | null;

  @ManyToOne(() => Package, { onDelete: 'SET NULL', nullable: true })
  package: Package | null;

  @ManyToOne(() => Programme, { onDelete: 'SET NULL', nullable: true })
  programme: Programme | null;

  @ManyToMany(() => Guest, (g) => g.cartItems)
  @JoinTable({ name: 'cart_items_guests' })
  guests: Guest[];

  @Column({
    type: 'enum',
    enum: CartItemType,
  })
  itemType: CartItemType;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'numeric', nullable: true })
  price: string;

  @Column({ type: 'numeric', nullable: true, name: 'subtotal' })
  subtotal: string;

  @Column({ type: 'timestamp', nullable: true, name: 'scheduled_date' })
  scheduledDate: Date;

  @Column({ type: 'time', nullable: true, name: 'scheduled_time' })
  scheduledTime: string;

  @Column({ nullable: true, name: 'notes' })
  notes: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
