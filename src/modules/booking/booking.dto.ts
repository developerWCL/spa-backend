import { PartialType } from '@nestjs/mapped-types';
import { Booking } from '../../entities/bookings.entity';

export class CreateBookingDto implements Partial<Booking> {
  customer?: any;
  branch?: any;
  subService?: any;
  package?: any;
  programme?: any;
  bed?: any;
  promotion?: any;
  bookingTime: Date;
  status?: string;
  totalAmount?: string;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
