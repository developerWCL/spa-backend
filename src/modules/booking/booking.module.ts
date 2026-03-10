import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from 'src/entities/bookings.entity';
import { BookingItem } from 'src/entities/booking_items.entity';
import { Promotion } from 'src/entities/promotions.entity';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingItem, Promotion]),
    TypeOrmModule,
  ],
  providers: [BookingService, SubscriptionClientService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
