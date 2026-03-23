import { PartialType } from '@nestjs/mapped-types';
import { Booking } from '../../entities/bookings.entity';
import { CartItemType } from '../../entities/enums/cart.enum';
import {
  BookingStatus,
  PaymentStatus,
  PaymentType,
} from '../../entities/enums/booking.enum';
import { EntityGuestGender } from '../../entities/enums/entity-guest.enum';
import { Payment } from 'src/entities/payments.entity';

export class CreateBookingDto implements Partial<Booking> {
  customer?: any;
  branch?: any;
  promotion?: any;

  bookingTime: Date;

  status?: BookingStatus;
  totalAmount?: string;
  amount?: string;
  discountAmount?: string;
  payments?: Payment[];
  itemsCount?: number;
  notes?: string;

  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  items?: (CreateBookingItemDto & { id?: string; _destroy?: boolean })[];
}

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

export class CreateBookingItemDto {
  // Accept either full entities or IDs for relations
  subService?: any;
  subServiceId?: string; // ID for SubService
  package?: any;
  packageId?: string; // ID for Package
  programme?: any;
  programmeId?: string; // ID for Programme
  bed?: any;
  bedId?: string; // ID for Bed
  guests?: any[]; // Guest IDs or CreateGuestForBookingDto objects
  guestData?: CreateGuestForBookingDto[]; // Guest data for creation
  spaId?: string; // Required for guest creation
  staff?: any;
  staffId?: string; // ID for Staff
  room?: any;
  roomId?: string; // ID for Room

  itemType: CartItemType;
  quantity?: number;
  price?: string;
  subtotal?: string;
  scheduledDate?: Date | string;
  scheduledTime?: string;
  notes?: string;
  duration?: number;
}

export class UpdateBookingItemDto extends PartialType(CreateBookingItemDto) {}
