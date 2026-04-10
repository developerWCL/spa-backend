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
import { Payment } from 'src/entities/payments.entity';
import { PaypalPendingOrder } from 'src/entities/paypal_pending_order.entity';
import { PaymentStatus } from 'src/entities/enums/booking.enum';
import { BookingService } from '../booking/booking.service';
import { MailService } from 'src/shared/services/mail.service';

@Controller('paypal')
export class PaypalController {
  private readonly logger = new Logger(PaypalController.name);

  constructor(
    private readonly paypalService: PaypalService,
    private readonly bookingService: BookingService,
    private readonly mailService: MailService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaypalPendingOrder)
    private readonly pendingOrderRepo: Repository<PaypalPendingOrder>,
  ) {}

  @Post('create-order')
  async createOrder(@Body() dto: CreatePaypalOrderDto) {
    const { approvalUrl, orderId } = await this.paypalService.createOrder(dto);

    // Store booking payload — no booking created in DB yet
    await this.pendingOrderRepo.save(
      this.pendingOrderRepo.create({
        paypalOrderId: orderId,
        branchId: dto.branchId,
        bookingPayload: dto.bookingPayload,
        bookingItems: dto.bookingItems ?? null,
      }),
    );

    return { approvalUrl, orderId };
  }

  @Get('capture')
  async captureReturn(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Missing token');
    }

    // Retrieve pending payload
    const pending = await this.pendingOrderRepo.findOne({
      where: { paypalOrderId: token },
    });
    if (!pending) {
      throw new BadRequestException(
        'PayPal order not found or already processed',
      );
    }

    // Capture the PayPal payment
    const { captureId } = await this.paypalService.captureOrder(
      token,
      pending.branchId,
    );

    // Now create the booking in DB
    const booking = await this.bookingService.create(
      pending.bookingPayload as any,
    );

    // Create booking items
    if (pending.bookingItems?.length) {
      for (const item of pending.bookingItems) {
        await this.bookingService.createBookingItem(booking.id, item as any);
      }
    }

    // Update payment with capture info (do this before emails to avoid blocking)
    const payments = await this.paymentRepo
      .createQueryBuilder('payment')
      .where('payment.bookingId = :bookingId', { bookingId: booking.id })
      .getMany();

    const payment = payments.find((p) => p.status === PaymentStatus.PENDING);
    if (payment) {
      payment.status = PaymentStatus.PAID;
      payment.paypalOrderId = token;
      payment.paypalCaptureId = captureId;
      await this.paymentRepo.save(payment);
    }

    // Clean up pending record
    await this.pendingOrderRepo.delete({ paypalOrderId: token });

    this.logger.log(
      `Payment captured, booking created: ${booking.id}, captureId: ${captureId}`,
    );

    // Send emails asynchronously (non-blocking) to avoid timeout
    this.sendEmailsAsync(booking.id);

    return { success: true, captureId, bookingId: booking.id };
  }

  /**
   * Send booking confirmation and admin notification emails asynchronously
   * This prevents email service delays from blocking the API response
   */
  private sendEmailsAsync(bookingId: string): void {
    const EMAIL_TIMEOUT_MS = 25_000;

    const work = async () => {
      const bookingWithDetails = await this.bookingService.findOne(bookingId);
      const customerEmail = bookingWithDetails.customer?.email;
      const customerName = bookingWithDetails.customer
        ? `${bookingWithDetails.customer.firstName} ${bookingWithDetails.customer.lastName}`
        : undefined;

      const emailPromises = [
        this.mailService.sendBookingConfirmationEmail(
          bookingWithDetails,
          customerEmail,
          customerName,
        ),
      ];

      if (bookingWithDetails.branch?.email) {
        emailPromises.push(
          this.mailService.sendBookingNotificationToAdmin(
            bookingWithDetails,
            bookingWithDetails.branch.email,
            bookingWithDetails.branch.name,
          ),
        );
      }

      await Promise.all(emailPromises);
      this.logger.log(`Emails sent for booking ${bookingId}`);
    };

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Email send timed out')), EMAIL_TIMEOUT_MS),
    );

    Promise.race([work(), timeout]).catch((error) => {
      this.logger.error(
        `Failed to send emails for booking ${bookingId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    });
  }
}
