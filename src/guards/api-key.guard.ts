import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionClientService } from '../shared/subscription-client.service';
import type { ValidateApiKeyResult } from '../shared/subscription-client.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly subClient: SubscriptionClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { subscription?: ValidateApiKeyResult }>();

    const rawApiKey =
      req.headers['x-api-key'] || req.headers['apikey'] || req.query.apiKey;
    const apiKey = Array.isArray(rawApiKey)
      ? rawApiKey[0]
      : typeof rawApiKey === 'string'
        ? rawApiKey
        : undefined;
    const service = process.env.SERVICE_NAME || 'Spa Pro';

    const result = await this.subClient.validateApiKey(
      apiKey as string,
      service,
    );
    if (result && result.valid) {
      // attach details to request for later handlers
      req.subscription = result;
      return true;
    }
    return false;
  }
}
