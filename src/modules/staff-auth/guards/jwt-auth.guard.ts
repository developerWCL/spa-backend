import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization scheme');
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = process.env.STAFF_JWT_SECRET || 'staff-dev-secret';
      const decoded = verify(token, secret as string);
      request.staff = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
