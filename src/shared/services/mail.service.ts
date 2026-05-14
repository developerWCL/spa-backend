import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Resend } from 'resend';
import { bookingReceivedTemplate } from '../templates/booking-recieved.template';
import { bookingConfirmedTemplate } from '../templates/booking-confirmed.template';
import { bookingPendingTemplate } from '../templates/booking-pending.template';
import { PaymentType } from 'src/entities/enums/booking.enum';
import { Booking } from 'src/entities/bookings.entity';
import { BookingItem } from 'src/entities/booking_items.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    this.resend = new Resend(apiKey);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    staffName: string,
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'onboarding@resend.dev',
        to:
          process.env.NODE_ENV === 'production'
            ? email
            : 'waritsara@webconnection.asia',
        subject: 'Password Reset Request - Orientala Spa',
        html: `
          <h2>Password Reset Request</h2>
          <p>Dear ${staffName},</p>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p>Best regards,<br/>Orientala Spa Team</p>
        `,
      });
    } catch (error) {
      console.error('Error sending password changed email:', error);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }

  async sendPasswordChangedEmail(
    email: string,
    staffName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: email,
        subject: 'Password Changed Successfully - Orientala Spa',
        html: `
          <h2>Password Changed</h2>
          <p>Dear ${staffName},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <br/>
          <p>Best regards,<br/>Orientala Spa Team</p>
        `,
      });
    } catch (error) {
      console.error('Error sending password changed email:', error);

      throw new InternalServerErrorException(
        'Failed to send password confirmation email',
      );
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: email,
        subject: 'Your OTP Code - Orientala Spa',
        html: `
          <h2>Your OTP Code</h2>
          <p>Dear ${email},</p>
          <p>Your OTP code is <b>${otp}</b>.</p>
          <p>If you did not request this OTP, please contact support immediately.</p>
          <br/>
          <p>Best regards,<br/>Orientala Spa Team</p>
        `,
      });
    } catch (error) {
      console.error('Error sending OTP email:', error);

      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  async sendRegistrationVerificationEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: email,
        subject: 'Registration Verified - Orientala Spa',
        html: `
          <h2>Registration Successful</h2>
          <p>Dear ${firstName},</p>
          <p>Your email has been verified and your account is now active!</p>
          <br/>
          <p>You can now log in and start booking our spa services.</p>
          <br/>
          <p>Thank you for choosing Orientala Spa. We look forward to welcoming you!</p>
          <br/>
          <p>Best regards,<br/>Orientala Spa Team</p>
        `,
      });
    } catch (error) {
      console.error('Error sending registration verification email:', error);
      // Don't throw error to prevent verification from failing
    }
  }

  async sendPasswordResetVerificationEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: email,
        subject: 'Password Reset Completed - Orientala Spa',
        html: `
          <h2>Password Reset Completed</h2>
          <p>Dear ${firstName},</p>
          <p>Your password has been successfully reset!</p>
          <br/>
          <p>You can now log in with your new password.</p>
          <br/>
          <p>If you did not request this password reset, please contact our support team immediately.</p>
          <br/>
          <p>Best regards,<br/>Orientala Spa Team</p>
        `,
      });
    } catch (error) {
      console.error('Error sending password reset verification email:', error);
      // Don't throw error to prevent verification from failing
    }
  }

  /** Collect primary recipient + unique CC emails from all guests across all booking items. */
  private resolveRecipients(
    booking: any,
    customerEmail?: string,
    customerName?: string,
  ): { recipientEmail: string | null; recipientName: string; cc: string[] } {
    let recipientEmail: string | null = null;
    let recipientName: string = customerName || 'Guest';

    if (customerEmail) {
      recipientEmail = customerEmail;
    } else {
      // Use first guest of first item as primary
      const firstGuest = booking.items
        ?.flatMap((i: any) => i.guests ?? [])
        .find((g: any) => g?.email);
      if (firstGuest) {
        recipientEmail = firstGuest.email;
        recipientName = `${firstGuest.firstName} ${firstGuest.lastName}`;
      }
    }

    // Collect all unique guest emails for CC (excluding primary)
    const allGuestEmails: string[] = (booking.items ?? [])
      .flatMap((item: any) => item.guests ?? [])
      .map((g: any) => g?.email)
      .filter((email: any): email is string => !!email);

    const seen = new Set<string>();
    if (recipientEmail) seen.add(recipientEmail);
    const cc = allGuestEmails.filter((email) => {
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

    return { recipientEmail, recipientName, cc };
  }

  async sendBookingConfirmationEmail(
    booking: any,
    customerEmail?: string,
    customerName?: string,
  ): Promise<void> {
    const { recipientEmail, recipientName, cc } = this.resolveRecipients(
      booking,
      customerEmail,
      customerName,
    );

    this.logger.debug(
      `[sendBookingConfirmationEmail] items snapshot: ${JSON.stringify(
        booking.items?.map((i: any) => ({
          subSvcId: i.subService?.id,
          svcId: i.subService?.service?.id,
          svcTranslations: i.subService?.service?.translations,
          subSvcTranslations: i.subService?.translations,
          guests: i.guests?.map((g: any) => g.email),
        })),
      )}`,
    );

    if (!recipientEmail) {
      this.logger.warn(
        `[sendBookingConfirmationEmail] No recipient email for booking ${booking.bookingId}`,
      );
      return;
    }

    const services = this.extractServiceNames(booking);
    const bookingDate = this.extractBookingDate(booking);
    const guestCount = this.extractGuestCount(booking);
    const specialRequest = booking.items?.[0]?.notes || undefined;
    const branch = booking.branch;
    const spa = branch?.spa;
    const spaName = spa?.name;
    const logoUrl = spa?.metadata?.logo_url;
    const primaryColor = spa?.metadata?.primary_color;

    this.logger.log(
      `[sendBookingConfirmationEmail] Sending to ${recipientEmail}${cc.length ? ` cc=${cc.join(',')}` : ''} for booking ${booking.bookingId}`,
    );

    try {
      const guestEmail = booking.customer
        ? booking.customer.email
        : booking.items?.[0]?.guests?.[0]?.email;
      const guestPhone = booking.customer
        ? booking.customer.phone
        : booking.items?.[0]?.guests?.[0]?.phone;
      const paymentMethod = this.paymentTypeToText(
        booking.payments?.[0]?.paymentType,
      );

      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: recipientEmail,
        ...(cc.length > 0 && { cc }),
        subject: `Booking Received – ${booking.bookingId}`,
        html: bookingPendingTemplate({
          recipientName,
          bookingId: booking.bookingId,
          bookingDate,
          services,
          subtotalAmount: booking.amount
            ? parseFloat(booking.amount).toLocaleString('en-US')
            : undefined,
          totalAmount: parseFloat(booking.totalAmount || '0').toLocaleString(
            'en-US',
          ),
          discountAmount: booking.discountAmount
            ? parseFloat(booking.discountAmount).toLocaleString('en-US')
            : undefined,
          currency: 'THB',
          guestCount,
          specialRequest,
          branchName: branch?.name,
          branchPhone: branch?.phone,
          branchEmail: branch?.email,
          spaName,
          logoUrl,
          primaryColor,
          guestEmail,
          guestPhone,
          paymentMethod,
          promotionName: booking.promotion?.name,
          promotionCode: booking.promotion?.code,
        }),
      });
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
    }
  }

  private extractServiceNames(
    booking: Booking,
  ): { name: string; price: string }[] {
    if (!booking.items?.length) return [{ name: 'Spa Service', price: '0' }];
    return booking.items.map((item: BookingItem) => {
      const svcName = item.subService
        ? `${item?.subService?.service?.name} - ${item.subService.name}`
        : item.package
          ? item.package.name || 'Spa Service'
          : item.programme
            ? item.programme.name || 'Spa Service'
            : 'Spa Service';
      this.logger.debug(
        `[extractServiceNames] item subService=${item.subService?.id} svc.translations=${JSON.stringify(item.subService?.service?.translations)} resolved="${svcName}"`,
      );
      return {
        name: svcName,
        price: parseFloat(item.subtotal || '0').toLocaleString('en-US'),
      };
    });
  }

  private extractBookingDate(booking: any): string {
    const item = booking.items?.[0];
    const date = item?.scheduledDate || booking.bookingTime;
    if (!date) return 'TBD';
    const d = new Date(date);
    const datePart = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok', // Ensure date is formatted in spa's local timezone
    });
    const time = item?.scheduledTime.substring(0, 5); // Extract HH:mm
    return time ? `${datePart} at ${time}` : datePart;
  }

  private paymentTypeToText(paymentType: PaymentType): string {
    switch (paymentType) {
      case PaymentType.PAYPAL:
        return 'PayPal';
      case PaymentType.CREDIT_CARD:
        return 'Credit Card';
      case PaymentType.BANK_TRANSFER:
        return 'Bank Transfer';
      case PaymentType.ON_ARRIVAL:
        return 'Pay on Arrival';
      default:
        return paymentType || 'Unknown';
    }
  }
  private extractGuestCount(booking: any): number {
    // Sum quantity across all booking items
    if (booking.items?.length) {
      return booking.items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0,
      );
    }
    return booking.itemsCount || 1;
  }

  async sendBookingNotificationToAdmin(
    booking: any,
    adminEmail: string,
    branchName?: string,
  ): Promise<void> {
    if (!adminEmail) {
      console.warn('No admin email found for booking notification');
      return;
    }

    try {
      const services = this.extractServiceNames(booking);
      const bookingDate = this.extractBookingDate(booking);
      const guestCount = this.extractGuestCount(booking);
      const paymentType = this.paymentTypeToText(
        booking.payments?.[0]?.paymentType,
      );
      const branch = booking.branch;
      const spa = branch?.spa;
      const spaName = spa?.name;
      const logoUrl = spa?.metadata?.logo_url;
      const primaryColor = spa?.metadata?.primary_color;
      const customerName = booking.customer
        ? `${booking.customer.firstName} ${booking.customer.lastName}`
        : `${booking.items?.[0]?.guests?.[0] ? `${booking.items[0].guests[0].firstName} ${booking.items[0].guests[0].lastName}` : 'Guest'}`;

      const guestEmail = booking.customer
        ? booking.customer.email
        : booking.items?.[0]?.guests?.[0]?.email;
      const guestPhone = booking.customer
        ? booking.customer.phone
        : booking.items?.[0]?.guests?.[0]?.phone;
      const paymentMethod = this.paymentTypeToText(
        booking.payments?.[0]?.paymentType,
      );

      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: adminEmail,
        subject: `New Booking Created - ${booking.bookingId}`,
        html: bookingReceivedTemplate({
          recipientName: 'Admin',
          bookingId: booking.bookingId,
          bookingDate,
          services,
          subtotalAmount: booking.amount
            ? parseFloat(booking.amount).toLocaleString('en-US')
            : undefined,
          totalAmount: parseFloat(booking.totalAmount || '0').toLocaleString(
            'en-US',
          ),
          discountAmount: booking.discountAmount
            ? parseFloat(booking.discountAmount).toLocaleString('en-US')
            : undefined,
          currency: 'THB',
          guestCount,
          branchName: branch?.name,
          branchPhone: branch?.phone,
          branchEmail: branch?.email,
          spaName,
          logoUrl,
          primaryColor,
          paymentType,
          captureId: booking.payments?.[0]?.paypalCaptureId,
          guestName: customerName,
          guestEmail,
          guestPhone,
          paymentMethod,
          promotionName: booking.promotion?.name,
          promotionCode: booking.promotion?.code,
        }),
      });
    } catch (error) {
      console.error('Error sending booking notification to admin:', error);
      // Don't throw error to prevent booking creation from failing
    }
  }

  async sendBookingStatusUpdateEmail(
    booking: any,
    newStatus: string,
    customerEmail?: string,
    customerName?: string,
  ): Promise<void> {
    const { recipientEmail, recipientName, cc } = this.resolveRecipients(
      booking,
      customerEmail,
      customerName,
    );

    if (!recipientEmail) {
      this.logger.warn(
        `[sendBookingStatusUpdateEmail] No recipient email for booking ${booking.bookingId}, status=${newStatus}`,
      );
      return;
    }
    this.logger.log(
      `[sendBookingStatusUpdateEmail] Sending status=${newStatus} to ${recipientEmail}${cc.length ? ` cc=${cc.join(',')}` : ''} for booking ${booking.bookingId}`,
    );

    const services = this.extractServiceNames(booking);
    const bookingDate = this.extractBookingDate(booking);
    const guestCount = this.extractGuestCount(booking);
    const branch = booking.branch;
    const spa = branch?.spa;
    const spaName = spa?.name;
    const logoUrl = spa?.metadata?.logo_url;
    const primaryColor = spa?.metadata?.primary_color;

    try {
      if (newStatus.toLowerCase() === 'confirmed') {
        const guestEmail = booking.customer
          ? booking.customer.email
          : booking.items?.[0]?.guests?.[0]?.email;
        const guestPhone = booking.customer
          ? booking.customer.phone
          : booking.items?.[0]?.guests?.[0]?.phone;
        const paymentMethod = this.paymentTypeToText(
          booking.payments?.[0]?.paymentType,
        );

        await this.resend.emails.send({
          from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
          to: recipientEmail,
          ...(cc.length > 0 && { cc }),
          subject: `Booking Confirmed – ${booking.bookingId}`,
          html: bookingConfirmedTemplate({
            recipientName,
            bookingId: booking.bookingId,
            bookingDate,
            services,
            subtotalAmount: booking.amount
              ? parseFloat(booking.amount).toLocaleString('en-US')
              : undefined,
            totalAmount: parseFloat(booking.totalAmount || '0').toLocaleString(
              'en-US',
            ),
            discountAmount: booking.discountAmount
              ? parseFloat(booking.discountAmount).toLocaleString('en-US')
              : undefined,
            currency: 'THB',
            guestCount,
            branchName: branch?.name,
            branchPhone: branch?.phone,
            branchEmail: branch?.email,
            spaName,
            logoUrl,
            primaryColor,
            guestEmail,
            guestPhone,
            paymentMethod,
            promotionName: booking.promotion?.name,
            promotionCode: booking.promotion?.code,
          }),
        });
      } else if (newStatus.toLowerCase() === 'cancelled') {
        await this.resend.emails.send({
          from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
          to: recipientEmail,
          ...(cc.length > 0 && { cc }),
          subject: `Booking Cancelled – ${booking.bookingId}`,
          html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#374151;padding:32px;">
            <p>Dear <strong>${recipientName}</strong>,</p>
            <p>Your booking <strong>${booking.bookingId}</strong> has been cancelled.</p>
            <p>If you have any questions, please contact us.</p>
            ${branch?.name ? `<p style="margin-top:24px;color:#6b7280;font-size:13px;">${branch.name}${branch.phone ? ' · ' + branch.phone : ''}</p>` : ''}
          </body></html>`,
        });
      }
    } catch (error) {
      console.error('Error sending booking status update email:', error);
    }
  }
}
