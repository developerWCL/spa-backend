import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './customer-auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone: string;
      spaId: string;
    },
  ) {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.phone,
      dto.spaId,
    );
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: { email: string; otp: string; spaId: string }) {
    return this.authService.verifyOtp(dto.email, dto.otp, dto.spaId);
  }

  @Post('resend-otp')
  async resendOtp(@Body() dto: { email: string; spaId: string }) {
    return this.authService.resendOtp(dto.email, dto.spaId);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: { email: string; spaId: string }) {
    return this.authService.requestPasswordReset(dto.email, dto.spaId);
  }

  @Post('verify-password-reset-otp')
  async verifyPasswordResetOtp(
    @Body() dto: { email: string; otp: string; spaId: string },
  ) {
    return this.authService.verifyPasswordResetOtp(
      dto.email,
      dto.otp,
      dto.spaId,
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    dto: {
      email: string;
      otp: string;
      newPassword: string;
      spaId: string;
    },
  ) {
    return this.authService.resetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
      dto.spaId,
    );
  }

  @Post('resend-password-reset-otp')
  async resendPasswordResetOtp(@Body() dto: { email: string; spaId: string }) {
    return this.authService.resendPasswordResetOtp(dto.email, dto.spaId);
  }

  @Post('login')
  async login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  //   @Post('request-reset')
  //   async requestReset(@Body() dto: { email: string }) {
  //     return this.authService.requestPasswordReset(dto.email);
  //   }

  //   @Post('reset-password')
  //   async resetPassword(
  //     @Body() dto: { email: string; otp: string; newPassword: string },
  //   ) {
  //     return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  //   }
}
