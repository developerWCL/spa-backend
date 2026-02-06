import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class StaffJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { staff?: Record<string, unknown> }>();

    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    const auth = Array.isArray(authHeader)
      ? authHeader[0]
      : typeof authHeader === 'string'
        ? authHeader
        : undefined;
    if (!auth) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const match = auth.match(/Bearer\s+(.+)/i);
    if (!match) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const token = match[1];
    const secret = process.env.STAFF_JWT_SECRET || 'staff-dev-secret';

    try {
      const decodedUnknown = jwt.verify(token, secret);
      if (typeof decodedUnknown !== 'object' || decodedUnknown === null)
        return false;
      req.staff = decodedUnknown as Record<string, unknown>;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
