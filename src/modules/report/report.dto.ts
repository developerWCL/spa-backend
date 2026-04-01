export class ReportSummaryDto {
  totalRevenue: number;
  totalBookings: number;
  uniqueCustomers: number;
  avgBookingValue: number;
  revenueGrowth?: number;
  bookingsGrowth?: number;
  customersGrowth?: number;
  avgValueGrowth?: number;
}

export class BookingReportItemDto {
  bookingId: string;
  customer: string;
  serviceType: string;
  serviceName: string;
  duration: number; // in minutes
  serviceDate: Date;
  serviceTime: string; // HH:mm format
  price: number;
  bookingStatus: string;
  paymentStatus: string;
  bookingDate: Date;
}

export class TopServiceDto {
  serviceId: string;
  serviceName: string;
  serviceType: 'Service' | 'Package' | 'Programme';
  bookings: number;
  revenue: number;
  growth: number;
}

export class CustomerSegmentDto {
  segment: 'Authenticated' | 'Unauthenticated';
  count: number;
  revenue: number;
  avgSpending: number;
}

export class CustomerRetentionDto {
  repeatCustomerRate: number; // percentage
  newCustomersRate: number; // percentage
  returningCustomersRate: number; // percentage
  newCustomersCount: number;
  returningCustomersCount: number;
  totalCustomers: number;
  avgVisitsPerCustomer: number;
}

export class GuestReportItemDto {
  guestId: string;
  guest: string;
  email: string;
  gender: string;
  nationality: string;
  memberStatus: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalAmount: number;
  lastServiceDate: Date;
}

export class DateRangeQueryDto {
  branchId: string;
  startDate?: Date;
  endDate?: Date;
  dateRange?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  dateType?: 'bookingDate' | 'serviceDate';
}
