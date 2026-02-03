import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { subscription?: Record<string, unknown> }>();

    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    const auth = Array.isArray(authHeader)
      ? authHeader[0]
      : typeof authHeader === 'string'
        ? authHeader
        : undefined;
    if (!auth) return false;

    const match = auth.match(/Bearer\s+(.+)/i);
    if (!match) return false;

    const token = match[1];
    const secret = process.env.API_JWT_SECRET || 'dev-secret';

    try {
      const decoded = jwt.verify(token, secret) as Record<string, unknown>;
      req.subscription = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
