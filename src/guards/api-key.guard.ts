import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionClientService } from '../shared/subscription-client.service';
import { DataSource } from 'typeorm';
import { Spa } from '../entities/spa.entity';
import { decryptApiKey } from '../shared/crypto.util';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly subClient: SubscriptionClientService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const getHeader = (name: string) => {
      return (req.get && req.get(name)) || req.headers[name.toLowerCase()];
    };
    const rawSpaId = getHeader('spa-id');
    const spaId = Array.isArray(rawSpaId) ? rawSpaId[0] : rawSpaId;
    // find api key from db if spaId is provided
    let apiKey: string | undefined;
    if (spaId) {
      const spaRepo = this.dataSource.getRepository(Spa);
      const spa = await spaRepo.findOne({ where: { id: spaId } });

      if (spa) {
        const raw =
          spa.apiKey ?? (spa as unknown as Record<string, unknown>)['api_key'];
        if (typeof raw === 'string') {
          try {
            apiKey = decryptApiKey(raw);
          } catch (err: unknown) {
            const error =
              err instanceof Error ? err : new Error('Unknown error');
            console.error('Failed to decrypt API key for spaId:', spaId, error);
            return false;
          }
        }
      }
    }

    const result = await this.subClient.validateApiKey(apiKey);

    if (result && result.valid) {
      return true;
    }
    return false;
  }
}
