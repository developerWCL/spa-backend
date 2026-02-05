import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';

@Injectable()
export class CookiesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Check for access token in cookies
    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('Access token not found in cookies');
    }

    // Verify token
    try {
      const secret = process.env.STAFF_JWT_SECRET || 'staff-dev-secret';
      const decoded = verify(token, secret);
      // Add user data to request for later use
      (request as any).user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
