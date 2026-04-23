import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from 'src/entities/bookings.entity';
import { BookingItem } from 'src/entities/booking_items.entity';
import { Promotion } from 'src/entities/promotions.entity';
import { Guest } from 'src/entities/guests.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';
import { Room } from 'src/entities/rooms.entity';
import { Staff } from 'src/entities/staffs.entity';
import { GuestsModule } from '../guests/guests.module';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';
import { MailService } from 'src/shared/services/mail.service';
import { Payment } from 'src/entities/payments.entity';
import { OptionalJwtMiddleware } from 'src/middleware/optional-jwt.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingItem,
      Promotion,
      Guest,
      SubService,
      Package,
      Programme,
      Room,
      Staff,
      Payment,
    ]),
    GuestsModule,
    TypeOrmModule,
  ],
  providers: [BookingService, SubscriptionClientService, MailService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OptionalJwtMiddleware).forRoutes('bookings');
  }
}
