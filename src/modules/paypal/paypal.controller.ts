import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { CreatePaypalOrderDto } from './paypal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'src/entities/bookings.entity';
import { Payment } from 'src/entities/payments.entity';
import { PaymentStatus, BookingStatus } from 'src/entities/enums/booking.enum';

@Controller('paypal')
export class PaypalController {
  private readonly logger = new Logger(PaypalController.name);

  constructor(
    private readonly paypalService: PaypalService,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  @Post('create-order')
  async createOrder(@Body() dto: CreatePaypalOrderDto) {
    // Validate booking exists and has a pending payment
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId },
      relations: ['payments', 'branch'],
    });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const { approvalUrl, orderId } = await this.paypalService.createOrder(dto);

    // Store PayPal order ID on the pending payment record
    const pendingPayment = booking.payments?.find(
      (p) => p.status === PaymentStatus.PENDING,
    );
    if (pendingPayment) {
      pendingPayment.paypalOrderId = orderId;
      await this.paymentRepo.save(pendingPayment);
    }

    return { approvalUrl, orderId };
  }

  @Get('capture')
  async captureReturn(
    @Query('token') token: string,
    @Query('bookingId') bookingId: string,
  ) {
    if (!token || !bookingId) {
      throw new BadRequestException('Missing token or bookingId');
    }

    // Look up booking to get branchId
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['payments', 'branch'],
    });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const branchId = booking.branch?.id;
    if (!branchId) {
      throw new BadRequestException('Booking has no branch');
    }

    const { captureId } = await this.paypalService.captureOrder(
      token,
      branchId,
    );

    // Update payment record
    const payment = booking.payments?.find(
      (p) => p.paypalOrderId === token || p.status === PaymentStatus.PENDING,
    );
    if (payment) {
      payment.status = PaymentStatus.PAID;
      payment.paypalOrderId = token;
      payment.paypalCaptureId = captureId;
      await this.paymentRepo.save(payment);
    }

    // Update booking status
    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepo.save(booking);

    this.logger.log(
      `Payment captured for booking ${bookingId}, captureId: ${captureId}`,
    );

    return { success: true, captureId, bookingId };
  }
}
