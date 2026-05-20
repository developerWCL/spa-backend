import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaypalAccount } from 'src/entities/paypal_account.entity';
import { PaypalPendingOrder } from 'src/entities/paypal_pending_order.entity';
import { Branch } from 'src/entities/branch.entity';
import { Booking } from 'src/entities/bookings.entity';
import { Payment } from 'src/entities/payments.entity';
import { Spa } from 'src/entities/spa.entity';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { PaypalAccountService } from './paypal-account.service';
import { PaypalAccountController } from './paypal-account.controller';
import { BookingModule } from '../booking/booking.module';
import { MailService } from 'src/shared/services/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaypalAccount,
      PaypalPendingOrder,
      Branch,
      Booking,
      Payment,
      Spa,
    ]),
    BookingModule,
  ],
  controllers: [PaypalController, PaypalAccountController],
  providers: [PaypalService, PaypalAccountService, MailService],
  exports: [PaypalService, PaypalAccountService],
})
export class PaypalModule {}
