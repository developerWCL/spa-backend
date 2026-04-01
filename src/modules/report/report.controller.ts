import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import {
  ReportSummaryDto,
  DateRangeQueryDto,
  BookingReportItemDto,
  CustomerRetentionDto,
  GuestReportItemDto,
} from './report.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';

@Controller('reports')
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(StaffJwtAuthGuard)
  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary metrics' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiQuery({
    name: 'branchId',
    type: 'string',
    description: 'Branch ID',
    required: true,
  })
  @ApiQuery({
    name: 'dateRange',
    type: 'string',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    description: 'Date range for the report',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'dateType',
    type: 'string',
    enum: ['bookingDate', 'serviceDate'],
    description: 'Filter by booking date or service date',
    required: false,
  })
  async getSummary(
    @Query() query: DateRangeQueryDto,
  ): Promise<ReportSummaryDto> {
    // Convert date strings to Date objects if provided
    if (typeof query.startDate === 'string') {
      query.startDate = new Date(query.startDate);
    }
    if (typeof query.endDate === 'string') {
      query.endDate = new Date(query.endDate);
    }

    return this.reportService.getSummary(query);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('bookings')
  @ApiOperation({ summary: 'Get detailed booking report' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiQuery({
    name: 'branchId',
    type: 'string',
    description: 'Branch ID',
    required: true,
  })
  @ApiQuery({
    name: 'dateRange',
    type: 'string',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    description: 'Date range for the report',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'dateType',
    type: 'string',
    enum: ['bookingDate', 'serviceDate'],
    description: 'Filter by booking date or service date',
    required: false,
  })
  async getBookingReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<BookingReportItemDto[]> {
    // Convert date strings to Date objects if provided
    if (typeof query.startDate === 'string') {
      query.startDate = new Date(query.startDate);
    }
    if (typeof query.endDate === 'string') {
      query.endDate = new Date(query.endDate);
    }

    return this.reportService.getBookingReport(query);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('top-services')
  @ApiOperation({ summary: 'Get top performing services report' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiQuery({
    name: 'branchId',
    type: 'string',
    description: 'Branch ID',
    required: true,
  })
  @ApiQuery({
    name: 'dateRange',
    type: 'string',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    description: 'Date range for the report',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'dateType',
    type: 'string',
    enum: ['bookingDate', 'serviceDate'],
    description: 'Filter by booking date or service date',
    required: false,
  })
  async getTopServicesReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<any[]> {
    // Convert date strings to Date objects if provided
    if (typeof query.startDate === 'string') {
      query.startDate = new Date(query.startDate);
    }
    if (typeof query.endDate === 'string') {
      query.endDate = new Date(query.endDate);
    }

    return this.reportService.getTopServicesReport(query);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('customer-segments')
  @ApiOperation({
    summary: 'Get customer segments report (Authenticated vs Unauthenticated)',
  })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiQuery({
    name: 'branchId',
    type: 'string',
    description: 'Branch ID',
    required: true,
  })
  @ApiQuery({
    name: 'dateRange',
    type: 'string',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    description: 'Date range for the report',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'dateType',
    type: 'string',
    enum: ['bookingDate', 'serviceDate'],
    description: 'Filter by booking date or service date',
    required: false,
  })
  async getCustomerSegmentsReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<any[]> {
    // Convert date strings to Date objects if provided
    if (typeof query.startDate === 'string') {
      query.startDate = new Date(query.startDate);
    }
    if (typeof query.endDate === 'string') {
      query.endDate = new Date(query.endDate);
    }

    return this.reportService.getCustomerSegmentsReport(query);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('customer-retention')
  @ApiOperation({ summary: 'Get customer retention metrics' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiQuery({
    name: 'branchId',
    type: 'string',
    description: 'Branch ID',
    required: true,
  })
  @ApiQuery({
    name: 'dateRange',
    type: 'string',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    description: 'Date range for the report',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'dateType',
    type: 'string',
    enum: ['bookingDate', 'serviceDate'],
    description: 'Filter by booking date or service date',
    required: false,
  })
  async getCustomerRetention(
    @Query() query: DateRangeQueryDto,
  ): Promise<CustomerRetentionDto> {
    // Convert date strings to Date objects if provided
    if (typeof query.startDate === 'string') {
      query.startDate = new Date(query.startDate);
    }
    if (typeof query.endDate === 'string') {
      query.endDate = new Date(query.endDate);
    }

    return this.reportService.getCustomerRetention(query);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('guest-report')
  @ApiOperation({ summary: 'Get detailed guest report' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @ApiQuery({
    name: 'branchId',
    type: 'string',
    description: 'Branch ID',
    required: true,
  })
  @ApiQuery({
    name: 'dateRange',
    type: 'string',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    description: 'Date range for the report',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Start date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'End date (ISO format)',
    required: false,
  })
  @ApiQuery({
    name: 'dateType',
    type: 'string',
    enum: ['bookingDate', 'serviceDate'],
    description: 'Filter by booking date or service date',
    required: false,
  })
  async getGuestReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<GuestReportItemDto[]> {
    // Convert date strings to Date objects if provided
    if (typeof query.startDate === 'string') {
      query.startDate = new Date(query.startDate);
    }
    if (typeof query.endDate === 'string') {
      query.endDate = new Date(query.endDate);
    }

    return this.reportService.getGuestReport(query);
  }
}
