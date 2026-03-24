import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaypalAccount } from 'src/entities/paypal_account.entity';
import { Branch } from 'src/entities/branch.entity';
import { Booking } from 'src/entities/bookings.entity';
import { Payment } from 'src/entities/payments.entity';
import { Spa } from 'src/entities/spa.entity';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { PaypalAccountService } from './paypal-account.service';
import { PaypalAccountController } from './paypal-account.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaypalAccount, Branch, Booking, Payment, Spa]),
  ],
  controllers: [PaypalController, PaypalAccountController],
  providers: [PaypalService, PaypalAccountService],
  exports: [PaypalService, PaypalAccountService],
})
export class PaypalModule {}
