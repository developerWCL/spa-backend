import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
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

  async sendBookingConfirmationEmail(
    booking: any,
    customerEmail?: string,
    customerName?: string,
  ): Promise<void> {
    // Determine recipient email: if customer exists, send to customer; otherwise send to first guest
    let recipientEmail: string | null = null;
    let recipientName: string = customerName || 'Guest';

    if (customerEmail) {
      // Customer exists - send to customer email
      recipientEmail = customerEmail;
    } else if (
      booking.items &&
      booking.items.length > 0 &&
      booking.items[0].guests &&
      booking.items[0].guests.length > 0
    ) {
      // Anonymous booking - send to first guest email
      const firstGuest = booking.items[0].guests[0];
      recipientEmail = firstGuest.email;
      recipientName = `${firstGuest.firstName} ${firstGuest.lastName}`;
    }

    if (!recipientEmail) {
      console.warn('No recipient email found for booking confirmation');
      return;
    }

    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'noreply@orientala-spa.com',
        to: recipientEmail,
        subject: `Booking Confirmation - ${booking.bookingId}`,
        html: `
          <h2>Booking Confirmation</h2>
          <p>Dear ${recipientName},</p>
          <p>Your booking has been successfully created.</p>
          <br/>
          <h3>Booking Details</h3>
          <ul>
            <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
            <li><strong>Status:</strong> ${booking.status || 'Pending'}</li>
            <li><strong>Total Amount:</strong> ${booking.totalAmount || 'N/A'}</li>
          </ul>
          <br/>
          <p>Thank you for booking with Orientala Spa. We look forward to serving you!</p>
          <br/>
          <p>Best regards,<br/>Orientala Spa Team</p>
        `,
      });
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      // Don't throw error to prevent booking creation from failing
    }
  }
}
