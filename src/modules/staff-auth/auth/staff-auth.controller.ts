import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StaffAuthService } from './staff-auth.service';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LogoutDto } from '../dto/logout.dto';

@ApiTags('Staff Auth')
@Controller('staff-auth')
export class StaffAuthController {
  constructor(private readonly auth: StaffAuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, tokens set in HTTP-only cookies',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('Missing credentials');
    }

    const result = await this.auth.login(body.email, body.password);
    // Return staff data, access token and expiry time
    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      staff: result.staff,
      expiresIn: result.expiresIn,
    };
  }

  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Staff member not found' })
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body.email);
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.newPassword);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found in cookies');
    }

    const result = await this.auth.refreshToken(refreshToken);

    if (!result.success) {
      // Clear invalid refresh token
      res.clearCookie('refreshToken', { path: '/' });
      throw new BadRequestException(result.message || 'Token refresh failed');
    }

    // Set new access token
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      staff: result.staff,
      expiresIn: result.expiresIn,
    };
  }

  @ApiOperation({ summary: 'Logout (clear cookies)' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  @Post('logout')
  logout(): LogoutDto {
    return this.auth.logout();
  }
}
