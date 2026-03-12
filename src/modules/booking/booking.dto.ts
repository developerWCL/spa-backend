import { PartialType } from '@nestjs/mapped-types';
import { Booking } from '../../entities/bookings.entity';
import { BookingItem } from '../../entities/booking_items.entity';
import { CartItemType } from '../../entities/enums/cart.enum';
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
} from '../../entities/enums/booking.enum';
import { EntityGuestGender } from '../../entities/enums/entity-guest.enum';

export class CreateBookingDto implements Partial<Booking> {
  customer?: any;
  branch?: any;
  promotion?: any;

  bookingTime: Date;

  status?: BookingStatus;
  totalAmount?: string;
  itemsCount?: number;
  notes?: string;

  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}

export class CreateGuestForBookingDto {
  id?: string; // If guest already exists
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  gender?: EntityGuestGender | string;
  specialRequest?: string;
}

export class CreateBookingItemDto implements Partial<BookingItem> {
  subService?: any;
  package?: any;
  programme?: any;
  bed?: any;
  guests?: any[]; // Guest IDs or CreateGuestForBookingDto objects
  guestData?: CreateGuestForBookingDto[]; // Guest data for creation
  spaId?: string; // Required for guest creation

  itemType: CartItemType;
  quantity?: number;
  price?: string;
  subtotal?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  notes?: string;
  duration?: number;
}

export class UpdateBookingItemDto extends PartialType(CreateBookingItemDto) {}
