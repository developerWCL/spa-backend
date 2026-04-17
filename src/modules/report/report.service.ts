import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Booking } from 'src/entities/bookings.entity';
import { Payment } from 'src/entities/payments.entity';
import { Customer } from 'src/entities/customers.entity';
import { BookingStatus, PaymentStatus } from 'src/entities/enums/booking.enum';
import {
  ReportSummaryDto,
  DateRangeQueryDto,
  BookingReportItemDto,
  CustomerRetentionDto,
  GuestReportItemDto,
} from './report.dto';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('ReportService');
  }

  /**
   * Calculate date range based on dateRange parameter
   */
  private getDateRange(dateRange: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    return { startDate, endDate };
  }

  /**
   * Get summary report data for dashboard
   */
  async getSummary(query: DateRangeQueryDto): Promise<ReportSummaryDto> {
    this.logger.log('Generating report summary', { branchId: query.branchId });
    const { branchId } = query;
    let startDate = query.startDate;
    let endDate = query.endDate || new Date();

    // If no specific dates provided, use dateRange parameter
    if (!startDate && query.dateRange) {
      const dateRange = this.getDateRange(query.dateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    // If still no start date, default to 1 month
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get completed bookings for the period
    const completedBookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
        bookingTime: startDate && endDate ? undefined : undefined,
      },
      relations: ['customer', 'branch', 'items', 'items.guests'],
    });

    // Filter by date range
    let filteredBookings = completedBookings.filter(
      (booking) =>
        booking.bookingTime >= startDate && booking.bookingTime <= endDate,
    );

    // If filtering by service date, filter by scheduled date
    if (query.dateType === 'serviceDate') {
      filteredBookings = completedBookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    // Only count bookings that have items
    const bookingsWithItems = filteredBookings.filter(
      (booking) => booking.items && booking.items.length > 0,
    );

    // Get total revenue from paid payments
    const totalRevenue = bookingsWithItems.reduce(
      (sum, booking) => sum + parseFloat(booking.totalAmount || '0'),
      0,
    );

    // Get unique guests
    const uniqueGuestIds = new Set(
      bookingsWithItems
        .flatMap((b) => b.items.flatMap((item) => item.guests))
        .filter((g) => g?.id)
        .map((g) => g.id),
    );
    const uniqueCustomers = uniqueGuestIds.size;

    // Calculate average booking value
    const totalBookings = bookingsWithItems.length;
    const avgBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate growth metrics (compare with previous period)
    const growthMetrics = await this.calculateGrowthMetrics(
      branchId,
      startDate,
      endDate,
      query.dateType || 'bookingDate',
    );
    const data = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBookings,
      uniqueCustomers,
      avgBookingValue: Math.round(avgBookingValue * 100) / 100,
      revenueGrowth: growthMetrics.revenueGrowth,
      bookingsGrowth: growthMetrics.bookingsGrowth,
      customersGrowth: growthMetrics.customersGrowth,
      avgValueGrowth: growthMetrics.avgValueGrowth,
    };

    return data;
  }

  /**
   * Calculate growth metrics by comparing with previous period
   */
  private async calculateGrowthMetrics(
    branchId: string,
    startDate: Date,
    endDate: Date,
    dateType: string = 'bookingDate',
  ): Promise<{
    revenueGrowth: number;
    bookingsGrowth: number;
    customersGrowth: number;
    avgValueGrowth: number;
  }> {
    const periodLength = endDate.getTime() - startDate.getTime();

    // Previous period dates
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime());

    // Get previous period bookings
    const prevBookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'items', 'items.guests'],
    });

    let prevFilteredBookings = prevBookings.filter(
      (booking) =>
        booking.bookingTime >= prevStartDate &&
        booking.bookingTime <= prevEndDate,
    );

    // If filtering by service date, filter by scheduled date
    if (dateType === 'serviceDate') {
      prevFilteredBookings = prevBookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= prevStartDate &&
            item.scheduledDate <= prevEndDate,
        ),
      );
    }

    const prevBookingsWithItems = prevFilteredBookings.filter(
      (booking) => booking.items && booking.items.length > 0,
    );

    const prevRevenue = prevBookingsWithItems.reduce(
      (sum, booking) => sum + parseFloat(booking.totalAmount || '0'),
      0,
    );
    const prevBookingsCount = prevBookingsWithItems.length;
    const prevCustomers = new Set(
      prevBookingsWithItems
        .flatMap((b) => b.items.flatMap((item) => item.guests))
        .filter((g) => g?.id)
        .map((g) => g.id),
    ).size;
    const prevAvgValue =
      prevBookingsCount > 0 ? prevRevenue / prevBookingsCount : 0;

    // Current period data (for comparison)
    const currentBookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'items', 'items.guests'],
    });

    let currentFilteredBookings = currentBookings.filter(
      (booking) =>
        booking.bookingTime >= startDate && booking.bookingTime <= endDate,
    );

    // If filtering by service date, filter by scheduled date
    if (dateType === 'serviceDate') {
      currentFilteredBookings = currentBookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    const currentBookingsWithItems = currentFilteredBookings.filter(
      (booking) => booking.items && booking.items.length > 0,
    );

    const currentRevenue = currentBookingsWithItems.reduce(
      (sum, booking) => sum + parseFloat(booking.totalAmount || '0'),
      0,
    );
    const currentBookingsCount = currentBookingsWithItems.length;
    const currentCustomers = new Set(
      currentBookingsWithItems
        .flatMap((b) => b.items.flatMap((item) => item.guests))
        .filter((g) => g?.id)
        .map((g) => g.id),
    ).size;
    const currentAvgValue =
      currentBookingsCount > 0 ? currentRevenue / currentBookingsCount : 0;

    // Calculate percentage growth
    const revenueGrowth =
      prevRevenue > 0
        ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 1000) / 10
        : 0;
    const bookingsGrowth =
      prevBookingsCount > 0
        ? Math.round(
            ((currentBookingsCount - prevBookingsCount) / prevBookingsCount) *
              1000,
          ) / 10
        : 0;
    const customersGrowth =
      prevCustomers > 0
        ? Math.round(
            ((currentCustomers - prevCustomers) / prevCustomers) * 1000,
          ) / 10
        : 0;
    const avgValueGrowth =
      prevAvgValue > 0
        ? Math.round(((currentAvgValue - prevAvgValue) / prevAvgValue) * 1000) /
          10
        : 0;

    return {
      revenueGrowth,
      bookingsGrowth,
      customersGrowth,
      avgValueGrowth,
    };
  }

  /**
   * Get detailed booking report for the period
   */
  async getBookingReport(
    query: DateRangeQueryDto,
  ): Promise<BookingReportItemDto[]> {
    const { branchId } = query;
    let startDate = query.startDate;
    let endDate = query.endDate || new Date();

    // If no specific dates provided, use dateRange parameter
    if (!startDate && query.dateRange) {
      const dateRange = this.getDateRange(query.dateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    // If still no start date, default to 1 month
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get bookings for the period with all relations
    const bookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
        bookingTime: startDate && endDate ? undefined : undefined,
      },
      relations: [
        'customer',
        'branch',
        'items',
        'items.subService',
        'items.subService.service',
        'items.guests',
        'payments',
        'items.package',
        'items.programme',
      ],
      order: {
        bookingTime: 'ASC',
        items: {
          scheduledDate: 'ASC',
        },
      },
    });

    // Filter by date range and map to DTOs
    let filteredBookings = bookings.filter(
      (booking) =>
        booking.bookingTime >= startDate && booking.bookingTime <= endDate,
    );

    // If filtering by service date, filter by scheduled date
    if (query.dateType === 'serviceDate') {
      filteredBookings = bookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    const reportItems: BookingReportItemDto[] = filteredBookings.flatMap(
      (booking) =>
        booking.items.map((item) => {
          const serviceTime = item.scheduledTime
            ? `${item.scheduledTime.split(':')[0]}:${item.scheduledTime.split(':')[1]}`
            : '00:00';

          // Get payment status from last payment record
          const lastPayment = booking.payments
            ? booking.payments[booking.payments.length - 1]
            : null;
          const paymentStatus = lastPayment
            ? lastPayment.status === PaymentStatus.PAID
              ? 'Paid'
              : 'Pending'
            : 'No Payment';

          // Get customer name (from guest if customer not available)
          const customerName = booking.customer
            ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
            : item.guests && item.guests.length > 0
              ? `${item.guests[0].firstName || ''} ${item.guests[0].lastName || ''}`.trim()
              : 'Unknown';

          // Determine service type and name
          let serviceType = 'Unknown';
          let serviceName = 'N/A';
          let duration = 0;

          if (item.subService) {
            serviceType = 'Service';
            serviceName = item.subService.service.name || 'Unknown Service';
            if (item.subService) {
              serviceName += ` (${item.subService.name || 'Unknown SubService'})`;
            }
            duration = item.subService.durationMinutes || 0;
          } else if (item.package) {
            serviceType = 'Package';
            serviceName = item.package.name || 'Unknown Package';
            duration = item.duration || 0;
          } else if (item.programme) {
            serviceType = 'Programme';
            serviceName = item.programme.name || 'Unknown Programme';
            duration = item.duration || 0;
          }

          return {
            bookingId: booking.bookingId,
            customer: customerName,
            serviceType,
            serviceName,
            duration,
            serviceDate: item.scheduledDate,
            serviceTime,
            price: parseFloat(item.price || '0'),
            bookingStatus: booking.status,
            paymentStatus,
            bookingDate: booking.bookingTime,
          };
        }),
    );

    return reportItems;
  }

  /**
   * Get top performing services for the period
   */
  async getTopServicesReport(query: DateRangeQueryDto): Promise<any[]> {
    const { branchId } = query;
    let startDate = query.startDate;
    let endDate = query.endDate || new Date();

    // If no specific dates provided, use dateRange parameter
    if (!startDate && query.dateRange) {
      const dateRange = this.getDateRange(query.dateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    // If still no start date, default to 1 month
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get bookings for the period with all relations
    const bookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: [
        'items',
        'items.subService',
        'items.subService.service',
        'items.package',
        'items.programme',
      ],
      order: { bookingTime: 'DESC' },
    });

    // Filter by date range
    let filteredBookings = bookings.filter(
      (booking) =>
        booking.bookingTime >= startDate && booking.bookingTime <= endDate,
    );

    // If filtering by service date, filter by scheduled date
    if (query.dateType === 'serviceDate') {
      filteredBookings = bookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    // Map services with their data
    const servicesMap = new Map<
      string,
      {
        serviceId: string;
        serviceName: string;
        serviceType: 'Service' | 'Package' | 'Programme';
        bookings: number;
        revenue: number;
      }
    >();

    filteredBookings.forEach((booking) => {
      booking.items.forEach((item) => {
        let serviceId = '';
        let serviceName = '';
        let serviceType: 'Service' | 'Package' | 'Programme' = 'Service';

        if (item.subService) {
          serviceId = item.subService.id;
          serviceName = item.subService.name || 'Unknown Service';
          if (item.subService.service) {
            serviceName += ` (${item.subService.service.name})`;
          }
          serviceType = 'Service';
        } else if (item.package) {
          serviceId = item.package.id;
          serviceName = item.package.name || 'Unknown Package';
          serviceType = 'Package';
        } else if (item.programme) {
          serviceId = item.programme.id;
          serviceName = item.programme.name || 'Unknown Programme';
          serviceType = 'Programme';
        }

        if (!serviceId) return;

        const key = `${serviceType}:${serviceId}`;
        const existing = servicesMap.get(key) || {
          serviceId,
          serviceName,
          serviceType,
          bookings: 0,
          revenue: 0,
        };

        existing.bookings += 1;
        existing.revenue += parseFloat(item.price || '0');

        servicesMap.set(key, existing);
      });
    });

    // Get previous period data for growth calculation
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime());

    const prevBookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: [
        'items',
        'items.subService',
        'items.subService.service',
        'items.package',
        'items.programme',
      ],
    });

    const prevFilteredBookings = prevBookings.filter(
      (booking) =>
        booking.bookingTime >= prevStartDate &&
        booking.bookingTime <= prevEndDate,
    );

    const prevServicesMap = new Map<string, { revenue: number }>();

    prevFilteredBookings.forEach((booking) => {
      booking.items.forEach((item) => {
        let serviceId = '';
        let serviceType: 'Service' | 'Package' | 'Programme' = 'Service';
        let price = 0;

        if (item.subService) {
          serviceId = item.subService.id;
          serviceType = 'Service';
          price = parseFloat(item.subService.price || '0');
        } else if (item.package) {
          serviceId = item.package.id;
          serviceType = 'Package';
          price = parseFloat(item.package.price || '0');
        } else if (item.programme) {
          serviceId = item.programme.id;
          serviceType = 'Programme';
          price = parseFloat(item.programme.price || '0');
        }

        if (!serviceId) return;

        const key = `${serviceType}:${serviceId}`;
        const existing = prevServicesMap.get(key) || { revenue: 0 };
        existing.revenue += price;
        prevServicesMap.set(key, existing);
      });
    });

    // Convert to array and calculate growth
    const topServices = Array.from(servicesMap.values())
      .map((service) => {
        const key = `${service.serviceType}:${service.serviceId}`;
        const prevRevenue = prevServicesMap.get(key)?.revenue || 0;

        const growth =
          prevRevenue > 0
            ? Math.round(
                ((service.revenue - prevRevenue) / prevRevenue) * 1000,
              ) / 10
            : 0;

        return {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          serviceType: service.serviceType,
          bookings: service.bookings,
          revenue: Math.round(service.revenue * 100) / 100,
          growth,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return topServices;
  }

  /**
   * Get customer segments (Authenticated vs Unauthenticated) for the period
   */
  async getCustomerSegmentsReport(query: DateRangeQueryDto): Promise<any[]> {
    const { branchId } = query;
    let startDate = query.startDate;
    let endDate = query.endDate || new Date();

    // If no specific dates provided, use dateRange parameter
    if (!startDate && query.dateRange) {
      const dateRange = this.getDateRange(query.dateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    // If still no start date, default to 1 month
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get bookings for the period with all relations
    const bookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'items', 'items.guests'],
      order: { bookingTime: 'DESC' },
    });

    // Filter by date range
    let filteredBookings = bookings.filter(
      (booking) =>
        booking.bookingTime >= startDate && booking.bookingTime <= endDate,
    );

    // If filtering by service date, filter by scheduled date
    if (query.dateType === 'serviceDate') {
      filteredBookings = bookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    // Only count bookings that have items (same as getSummary)
    const bookingsWithItems = filteredBookings.filter(
      (booking) => booking.items && booking.items.length > 0,
    );

    // Segment customers
    const segments = {
      authenticated: {
        segment: 'Authenticated',
        customers: new Set<string>(),
        revenue: 0,
        bookingsCount: 0,
      },
      unauthenticated: {
        segment: 'Unauthenticated',
        customers: new Set<string>(),
        revenue: 0,
        bookingsCount: 0,
      },
    };

    bookingsWithItems.forEach((booking) => {
      const bookingRevenue = parseFloat(booking.totalAmount || '0');

      // Check if customer is authenticated (has customer record)
      if (booking.customer && booking.customer.id) {
        segments.authenticated.customers.add(booking.customer.id);
        segments.authenticated.revenue += bookingRevenue;
        segments.authenticated.bookingsCount += 1;
      } else {
        // Unauthenticated bookings (made by guests)
        if (booking.items && booking.items.length > 0) {
          booking.items.forEach((item) => {
            if (item.guests && item.guests.length > 0) {
              item.guests.forEach((guest) => {
                if (guest.id) {
                  segments.unauthenticated.customers.add(guest.id);
                }
              });
            }
          });
        }
        segments.unauthenticated.revenue += bookingRevenue;
        segments.unauthenticated.bookingsCount += 1;
      }
    });

    // Format segments for response
    const customerSegments = [
      {
        segment: segments.authenticated.segment,
        count: segments.authenticated.customers.size,
        revenue: Math.round(segments.authenticated.revenue * 100) / 100,
        avgSpending:
          segments.authenticated.customers.size > 0
            ? Math.round(
                (segments.authenticated.revenue /
                  segments.authenticated.customers.size) *
                  100,
              ) / 100
            : 0,
      },
      {
        segment: segments.unauthenticated.segment,
        count: segments.unauthenticated.customers.size,
        revenue: Math.round(segments.unauthenticated.revenue * 100) / 100,
        avgSpending:
          segments.unauthenticated.customers.size > 0
            ? Math.round(
                (segments.unauthenticated.revenue /
                  segments.unauthenticated.customers.size) *
                  100,
              ) / 100
            : 0,
      },
    ];

    return customerSegments;
  }

  /**
   * Get customer retention metrics for the period
   */
  async getCustomerRetention(
    query: DateRangeQueryDto,
  ): Promise<CustomerRetentionDto> {
    const { branchId } = query;
    let startDate = query.startDate;
    let endDate = query.endDate || new Date();

    // If no specific dates provided, use dateRange parameter
    if (!startDate && query.dateRange) {
      const range = this.getDateRange(query.dateRange);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    // If still no start date, default to 1 month
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get all bookings for the period (with items and guests)
    const bookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'items', 'items.guests'],
    });

    // Filter by date range and only bookings with items
    let filteredBookings = bookings.filter(
      (booking) =>
        booking.bookingTime >= startDate &&
        booking.bookingTime <= endDate &&
        booking.items &&
        booking.items.length > 0,
    );

    // If filtering by service date, filter by scheduled date
    if (query.dateType === 'serviceDate') {
      filteredBookings = bookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    // Get unique guests in this period
    const guestIdsInPeriod = new Set(
      filteredBookings
        .flatMap((b) => b.items.flatMap((item) => item.guests))
        .filter((g) => g?.id)
        .map((g) => g.id),
    );

    // Get previous period start date for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDuration);
    const prevEndDate = new Date(startDate.getTime());

    // Get all bookings from ALL time before current period
    const allBookingsBeforePeriod = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'items', 'items.guests'],
    });

    // Filter bookings from before the current period (not in period)
    const bookingsBeforePeriod = allBookingsBeforePeriod.filter(
      (booking) =>
        booking.bookingTime < startDate &&
        booking.items &&
        booking.items.length > 0,
    );

    // Get guests who booked before this period
    const guestsBeforePeriod = new Set(
      bookingsBeforePeriod
        .flatMap((b) => b.items.flatMap((item) => item.guests))
        .filter((g) => g?.id)
        .map((g) => g.id),
    );

    // Separate into new and returning guests
    const newGuestIds = new Array(...guestIdsInPeriod).filter(
      (id) => !guestsBeforePeriod.has(id),
    );
    const returningGuestIds = new Array(...guestIdsInPeriod).filter((id) =>
      guestsBeforePeriod.has(id),
    );

    const newGuestsCount = newGuestIds.length;
    const returningGuestsCount = returningGuestIds.length;
    const totalGuests = guestIdsInPeriod.size;

    // Calculate repeat guest rate (guests who booked more than once in this period)
    const guestBookingCounts = new Map<string, number>();
    filteredBookings.forEach((booking) => {
      booking.items.forEach((item) => {
        item.guests?.forEach((guest) => {
          if (guest?.id) {
            guestBookingCounts.set(
              guest.id,
              (guestBookingCounts.get(guest.id) || 0) + 1,
            );
          }
        });
      });
    });

    const repeatGuestsCount = Array.from(guestBookingCounts.values()).filter(
      (count) => count > 1,
    ).length;
    const repeatGuestRate =
      totalGuests > 0
        ? Math.round((repeatGuestsCount / totalGuests) * 100 * 100) / 100
        : 0;

    const newGuestsRate =
      totalGuests > 0
        ? Math.round((newGuestsCount / totalGuests) * 100 * 100) / 100
        : 0;

    const returningGuestsRate =
      totalGuests > 0
        ? Math.round((returningGuestsCount / totalGuests) * 100 * 100) / 100
        : 0;

    // Calculate average visits per guest
    const totalVisits = Array.from(guestBookingCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const avgVisitsPerGuest =
      totalGuests > 0 ? Math.round((totalVisits / totalGuests) * 100) / 100 : 0;

    return {
      repeatCustomerRate: repeatGuestRate,
      newCustomersRate: newGuestsRate,
      returningCustomersRate: returningGuestsRate,
      newCustomersCount: newGuestsCount,
      returningCustomersCount: returningGuestsCount,
      totalCustomers: totalGuests,
      avgVisitsPerCustomer: avgVisitsPerGuest,
    };
  }

  /**
   * Get guest report with member status and engagement metrics
   */
  async getGuestReport(
    query: DateRangeQueryDto,
  ): Promise<GuestReportItemDto[]> {
    const { branchId } = query;
    let startDate = query.startDate;
    let endDate = query.endDate || new Date();

    // If no specific dates provided, use dateRange parameter
    if (!startDate && query.dateRange) {
      const dateRange = this.getDateRange(query.dateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    // If still no start date, default to 1 month
    if (!startDate) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get bookings for the period
    const bookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'branch', 'items', 'items.guests'],
    });

    // Filter by date range
    let filteredBookings = bookings.filter(
      (booking) =>
        booking.bookingTime >= startDate && booking.bookingTime <= endDate,
    );

    // If filtering by service date, filter by scheduled date
    if (query.dateType === 'serviceDate') {
      filteredBookings = bookings.filter((booking) =>
        booking.items.some(
          (item) =>
            item.scheduledDate &&
            item.scheduledDate >= startDate &&
            item.scheduledDate <= endDate,
        ),
      );
    }

    // Get all bookings to calculate member status
    const allBookings = await this.bookingRepository.find({
      where: {
        branch: { id: branchId },
        status: In([BookingStatus.COMPLETED, BookingStatus.CONFIRMED]),
      },
      relations: ['customer', 'items', 'items.guests'],
    });

    // Extract unique guests from filtered bookings
    const guestMap = new Map<
      string,
      GuestReportItemDto & { visitCount: number; lastDate: Date }
    >();

    filteredBookings.forEach((booking) => {
      booking.items.forEach((item) => {
        item.guests?.forEach((guest) => {
          if (guest?.id) {
            if (!guestMap.has(guest.id)) {
              guestMap.set(guest.id, {
                guestId: guest.id,
                guest:
                  `${guest.firstName || ''} ${guest.lastName || ''}`.trim(),
                email: guest.email || '',
                gender: guest.gender || '',
                nationality: guest.nationality || '',
                memberStatus: 'Bronze',
                totalAmount: 0,
                lastServiceDate: new Date(),
                visitCount: 0,
                lastDate: item.scheduledDate || booking.bookingTime,
              });
            }
            const guestData = guestMap.get(guest.id);
            guestData.visitCount += 1;
            guestData.totalAmount += Number(item.price) || 0;
            if (item.scheduledDate && item.scheduledDate > guestData.lastDate) {
              guestData.lastDate = item.scheduledDate;
            }
          }
        });
      });
    });

    // Calculate member status based on total visits across ALL time
    guestMap.forEach((guest) => {
      const totalVisits = allBookings.reduce((count, booking) => {
        const guestVisits = booking.items.reduce((itemCount, item) => {
          const hasGuest = item.guests?.some((g) => g?.id === guest.guestId)
            ? 1
            : 0;
          return itemCount + hasGuest;
        }, 0);
        return count + guestVisits;
      }, 0);

      // Determine member status based on total visit count
      if (totalVisits > 25) {
        guest.memberStatus = 'Platinum';
      } else if (totalVisits > 15) {
        guest.memberStatus = 'Gold';
      } else if (totalVisits > 5) {
        guest.memberStatus = 'Silver';
      } else {
        guest.memberStatus = 'Bronze';
      }

      guest.lastServiceDate = guest.lastDate;
    });

    // Convert to GuestReportItemDto array and remove helper properties
    return Array.from(guestMap.values()).map(
      ({ visitCount, lastDate, ...item }) => item,
    );
  }
}
