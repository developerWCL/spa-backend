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
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

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
}
