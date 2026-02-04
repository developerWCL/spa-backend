import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SubscriptionClientService } from '../../shared/subscription-client.service';
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

type RefreshEntry = {
  companyId?: string;
  subscriptionId?: string;
  expiresAt: number;
};

@Injectable()
export class AuthService {
  // Typed wrappers around jsonwebtoken functions to avoid `any` calls
  private readonly jwtSign = sign as (
    payload: unknown,
    secret: Secret,
    options?: SignOptions,
  ) => string;
  private readonly jwtVerify = verify as (
    token: string,
    secret: Secret,
  ) => unknown;

  constructor(private readonly subClient: SubscriptionClientService) {}

  // In-memory refresh token store: jti -> metadata
  // Production: replace with Redis or DB for persistence and horizontal scaling
  private refreshStore = new Map<string, RefreshEntry>();

  async issueToken(apiKey?: string) {
    const result = await this.subClient.validateApiKey(apiKey);
    if (!result || !result.valid) {
      throw new UnauthorizedException('Invalid API key');
    }

    const payload: Record<string, unknown> = {
      companyId: result.companyId,
      subscriptionId: result.subscriptionId,
      issuedAt: Date.now(),
    };

    const secret = process.env.API_JWT_SECRET || 'dev-secret';
    const expiresIn = process.env.API_JWT_EXPIRES_IN || '15m';

    const opts: any = { expiresIn };
    const accessToken = this.jwtSign(payload, secret as Secret, opts);

    // create refresh token
    const refreshSecret = process.env.API_REFRESH_SECRET || secret;
    const refreshExpiresIn = process.env.API_REFRESH_EXPIRES_IN || '7d';
    const jti = randomBytes(16).toString('hex');
    const refreshPayload = { ...payload, jti } as Record<string, unknown>;
    const refreshOpts: any = { expiresIn: refreshExpiresIn };
    const refreshToken = this.jwtSign(
      refreshPayload,
      refreshSecret as Secret,
      refreshOpts,
    );

    // store refresh token metadata keyed by jti
    const expiresMs = this.parseExpiryToMs(refreshExpiresIn);
    this.refreshStore.set(jti, {
      companyId: result.companyId,
      subscriptionId: result.subscriptionId,
      expiresAt: Date.now() + expiresMs,
    });

    return {
      accessToken,
      expiresIn,
      refreshToken,
      refreshExpiresIn,
    };
  }

  // Accept a refresh token, validate it and issue a new access + refresh token (rotation)
  refreshWithToken(token: string) {
    const refreshSecret =
      process.env.API_REFRESH_SECRET ||
      process.env.API_JWT_SECRET ||
      'dev-secret';
    let decoded: Record<string, unknown>;
    try {
      const v: unknown = this.jwtVerify(token, refreshSecret as Secret);
      if (typeof v !== 'object' || v === null) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      decoded = v as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const jti = typeof decoded.jti === 'string' ? decoded.jti : undefined;
    if (!jti) throw new UnauthorizedException('Invalid refresh token');

    const entry = this.refreshStore.get(jti);
    if (!entry) throw new UnauthorizedException('Refresh token revoked');
    if (Date.now() > entry.expiresAt) {
      this.refreshStore.delete(jti);
      throw new UnauthorizedException('Refresh token expired');
    }

    // rotate: remove old jti and issue new tokens
    this.refreshStore.delete(jti);

    const payload: Record<string, unknown> = {
      companyId: entry.companyId,
      subscriptionId: entry.subscriptionId,
      issuedAt: Date.now(),
    };

    const secret = process.env.API_JWT_SECRET || 'dev-secret';
    const expiresIn = process.env.API_JWT_EXPIRES_IN || '15m';
    const accessToken = this.jwtSign(
      payload,
      secret as Secret,
      { expiresIn } as unknown as SignOptions,
    );

    const newJti = randomBytes(16).toString('hex');
    const refreshExpiresIn = process.env.API_REFRESH_EXPIRES_IN || '7d';
    const refreshSecret2 = process.env.API_REFRESH_SECRET || secret;
    const refreshToken = this.jwtSign(
      { ...payload, jti: newJti },
      refreshSecret2 as Secret,
      { expiresIn: refreshExpiresIn } as unknown as SignOptions,
    );

    const expiresMs = this.parseExpiryToMs(refreshExpiresIn);
    this.refreshStore.set(newJti, {
      companyId: entry.companyId,
      subscriptionId: entry.subscriptionId,
      expiresAt: Date.now() + expiresMs,
    });

    return { accessToken, expiresIn, refreshToken, refreshExpiresIn };
  }

  // Revoke a refresh token so it cannot be used again
  revokeRefreshToken(token: string) {
    const refreshSecret =
      process.env.API_REFRESH_SECRET ||
      process.env.API_JWT_SECRET ||
      'dev-secret';
    let decoded: Record<string, unknown>;
    try {
      const v: unknown = this.jwtVerify(token, refreshSecret as Secret);
      if (typeof v !== 'object' || v === null) {
        // token invalid -> nothing to revoke
        return;
      }
      decoded = v as Record<string, unknown>;
    } catch {
      // token invalid -> nothing to revoke
      return;
    }
    const jti = typeof decoded.jti === 'string' ? decoded.jti : undefined;
    if (jti) this.refreshStore.delete(jti);
  }

  private parseExpiryToMs(value: string) {
    // support simple formats like '15m', '7d', '1h' or numeric seconds
    if (!value) return 7 * 24 * 60 * 60 * 1000;
    const num = Number(value);
    if (!Number.isNaN(num)) return num * 1000; // seconds
    const unit = value.slice(-1);
    const amount = Number(value.slice(0, -1));
    if (Number.isNaN(amount)) return 7 * 24 * 60 * 60 * 1000;
    switch (unit) {
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'm':
        return amount * 60 * 1000;
      default:
        return amount * 1000;
    }
  }

  verifyToken(token: string) {
    const secret = process.env.API_JWT_SECRET || 'dev-secret';
    try {
      const v: unknown = this.jwtVerify(token, secret as Secret);
      if (typeof v !== 'object' || v === null) {
        throw new UnauthorizedException('Invalid token');
      }
      return v as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
