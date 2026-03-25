import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './customer-auth.service';
import { GoogleOAuthService } from './google-oauth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

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

  /**
   * Google OAuth login endpoint
   * Accepts user info from NextAuth frontend
   * @param dto - Google user info and spaId
   */
  @Post('login/google')
  async loginWithGoogle(
    @Body()
    dto: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
      spaId: string;
    },
  ) {
    const googleUserInfo = this.googleOAuthService.validateGoogleUserInfo({
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      profilePicture: dto.profilePicture,
    });
    return this.authService.loginWithGoogle(googleUserInfo, dto.spaId);
  }

  /**
   * Google OAuth login with ID token
   * Verifies the ID token and logs in/creates customer
   * @param dto - Google ID token and spaId
   */
  @Post('login/google-token')
  async loginWithGoogleToken(@Body() dto: { idToken: string; spaId: string }) {
    return this.authService.loginWithGoogleIdToken(dto.idToken, dto.spaId);
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
