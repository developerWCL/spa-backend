import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from 'src/entities/cart.entity';
import { CartItem } from 'src/entities/cart_items.entity';
import { Customer } from 'src/entities/customers.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Customer,
      SubService,
      Package,
      Programme,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
