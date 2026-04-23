import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OptionalJwtMiddleware implements NestMiddleware {
  use(
    req: Request & { staff?: Record<string, unknown> },
    res: Response,
    next: NextFunction,
  ) {
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    const auth = Array.isArray(authHeader)
      ? authHeader[0]
      : typeof authHeader === 'string'
        ? authHeader
        : undefined;

    if (!auth) {
      // No token provided, continue without user info
      return next();
    }

    const match = auth.match(/Bearer\s+(.+)/i);
    if (!match) {
      // Invalid format, continue without user info
      return next();
    }

    const token = match[1];
    const secret = process.env.STAFF_JWT_SECRET || 'staff-dev-secret';

    try {
      const decodedUnknown = jwt.verify(token, secret);
      if (typeof decodedUnknown === 'object' && decodedUnknown !== null) {
        req.staff = decodedUnknown as Record<string, unknown>;
      }
    } catch (error) {
      // Token invalid/expired, but don't throw - continue without user info
      // Optionally log this for debugging
    }

    next();
  }
}
