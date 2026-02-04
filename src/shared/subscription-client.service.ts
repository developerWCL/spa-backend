import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export type ValidateApiKeyResult = {
  valid: boolean;
  companyId?: string;
  subscriptionId?: string;
  [key: string]: unknown;
};

@Injectable()
export class SubscriptionClientService {
  private readonly logger = new Logger(SubscriptionClientService.name);
  private baseUrl =
    process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:8001';
  private serviceToken = process.env.SERVICE_TOKEN || '';
  private serviceName = process.env.SERVICE_NAME || '';
  async validateApiKey(apiKey?: string): Promise<ValidateApiKeyResult> {
    const headers: Record<string, string> = {};
    if (apiKey) headers['x-api-key'] = apiKey;
    headers['x-service-token'] = this.serviceToken;

    const url = `${this.baseUrl.replace(/\/$/, '')}/subscriptions/validate-key`;
    const options = { headers, timeout: 3000 };

    // try once, then one retry on failure
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const resp = await axios.post<ValidateApiKeyResult>(
          url,
          { service: this.serviceName },
          options,
        );
        return resp.data;
      } catch (err: unknown) {
        // narrow unknown error to axios or generic Error
        let code = 'no-code';
        let msg = 'no-message';
        let status: number | undefined;
        let respData: unknown;

        if (axios.isAxiosError(err)) {
          const axErr = err as AxiosError<unknown>;
          const maybeCode = axErr.code;
          if (typeof maybeCode === 'string' && maybeCode) {
            code = maybeCode;
          }
          msg = axErr.message || msg;
          status = axErr.response?.status;
          respData = axErr.response?.data;
        } else if (err instanceof Error) {
          msg = err.message;
        }

        this.logger.warn(
          `subscription service call failed (attempt ${attempt}): code=${code} status=${status} msg=${msg}`,
        );
        if (respData)
          this.logger.debug(`response data: ${JSON.stringify(respData)}`);
        if (attempt === 2) {
          return { valid: false };
        }
        // small delay before retry
        await new Promise((r) => setTimeout(r, 250 * attempt));
      }
    }
  }
}
