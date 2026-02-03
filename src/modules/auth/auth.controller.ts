import {
  Controller,
  Post,
  Req,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Exchange an API key for a short-lived JWT
  @Post('token')
  async token(@Req() req: Request) {
    const rawApiKey =
      req.headers['x-api-key'] || req.headers['apikey'] || req.query.apiKey;
    const apiKey = Array.isArray(rawApiKey)
      ? rawApiKey[0]
      : typeof rawApiKey === 'string'
        ? rawApiKey
        : undefined;
    if (!apiKey || typeof apiKey !== 'string') {
      throw new BadRequestException('Missing API key');
    }

    return this.authService.issueToken(apiKey);
  }

  // Rotate refresh token and return new access + refresh tokens
  @Post('refresh')
  refresh(@Req() req: Request, @Body() body: { refreshToken?: string }) {
    const headerToken =
      req.headers['x-refresh-token'] || req.headers['refresh-token'];
    const raw =
      body?.refreshToken ||
      (Array.isArray(headerToken)
        ? headerToken[0]
        : typeof headerToken === 'string'
          ? headerToken
          : undefined);
    if (!raw || typeof raw !== 'string') {
      throw new BadRequestException('Missing refresh token');
    }

    return this.authService.refreshWithToken(raw);
  }

  // Revoke refresh token (logout)
  @Post('revoke')
  revoke(@Req() req: Request, @Body() body: { refreshToken?: string }) {
    const headerToken =
      req.headers['x-refresh-token'] || req.headers['refresh-token'];
    const raw =
      body?.refreshToken ||
      (Array.isArray(headerToken)
        ? headerToken[0]
        : typeof headerToken === 'string'
          ? headerToken
          : undefined);
    if (!raw || typeof raw !== 'string') {
      throw new BadRequestException('Missing refresh token');
    }

    this.authService.revokeRefreshToken(raw);
    return { revoked: true };
  }
}
