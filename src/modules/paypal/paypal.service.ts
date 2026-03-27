import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import { PaypalAccountService } from './paypal-account.service';
import { CreatePaypalOrderDto } from './paypal.dto';

interface PaypalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);

  constructor(
    private readonly accountService: PaypalAccountService,
  ) {}

  private baseUrl(mode: string): string {
    return mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(branchId: string): Promise<{ token: string; mode: string }> {
    const creds = await this.accountService.getAccountForBranch(branchId);

    this.logger.debug(
      `PayPal auth attempt — mode: ${creds.mode}, clientId starts: ${creds.clientId?.slice(0, 8)}..., secret length: ${creds.clientSecret?.length}`,
    );

    const credentials = Buffer.from(
      `${creds.clientId}:${creds.clientSecret}`,
    ).toString('base64');
    const url = this.baseUrl(creds.mode);

    try {
      const { data } = await axios.post(
        `${url}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return { token: data.access_token, mode: creds.mode };
    } catch (err) {
      this.logger.error(
        `Failed to get PayPal access token — ${err?.response?.status} ${JSON.stringify(err?.response?.data)}`,
      );
      throw new InternalServerErrorException(
        'Could not authenticate with PayPal',
      );
    }
  }

  async createOrder(
    dto: CreatePaypalOrderDto,
  ): Promise<{ approvalUrl: string; orderId: string }> {
    const { token, mode } = await this.getAccessToken(dto.branchId);
    const url = this.baseUrl(mode);

    const bookingEngineUrl =
      process.env.BOOKING_ENGINE_URL || 'http://localhost:3000';

    const locale = dto.locale || 'en';
    const basePath = `${bookingEngineUrl}/${locale}/${dto.spaId}/payment-gateway`;
    const returnUrl = `${basePath}/callback?bookingId=${dto.bookingId}`;
    const cancelUrl = `${basePath}?bookingId=${dto.bookingId}&method=paypal&cancelled=true`;

    const description = dto.description || `Orientala Spa - Booking #${dto.bookingId}`;

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: dto.bookingId,
          custom_id: dto.bookingId,
          description,
          amount: {
            currency_code: dto.currency || 'THB',
            value: dto.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'Orientala Spa',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    this.logger.debug(`PayPal create-order payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const { data } = await axios.post<PaypalOrderResponse>(
        `${url}/v2/checkout/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.debug(`PayPal create-order response: ${JSON.stringify(data, null, 2)}`);

      const approvalLink = data.links.find((l) => l.rel === 'approve');
      if (!approvalLink) {
        throw new InternalServerErrorException(
          'PayPal did not return an approval URL',
        );
      }

      this.logger.log(
        `PayPal order created: ${data.id} for booking ${dto.bookingId}`,
      );
      return { approvalUrl: approvalLink.href, orderId: data.id };
    } catch (err) {
      this.logger.error(
        'Failed to create PayPal order',
        err?.response?.data ?? err,
      );
      throw new InternalServerErrorException('Could not create PayPal order');
    }
  }

  async captureOrder(
    orderId: string,
    branchId: string,
  ): Promise<{ status: string; captureId: string; bookingId: string }> {
    const { token, mode } = await this.getAccessToken(branchId);
    const url = this.baseUrl(mode);

    try {
      const { data } = await axios.post(
        `${url}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (data.status !== 'COMPLETED') {
        throw new BadRequestException(
          `PayPal capture status: ${data.status}`,
        );
      }

      const capture = data.purchase_units[0]?.payments?.captures?.[0];
      const bookingId = data.purchase_units[0]?.custom_id ?? '';

      this.logger.log(
        `PayPal order captured: ${orderId}, capture: ${capture?.id}`,
      );
      return {
        status: data.status,
        captureId: capture?.id ?? '',
        bookingId,
      };
    } catch (err) {
      this.logger.error(
        'Failed to capture PayPal order',
        err?.response?.data ?? err,
      );
      throw new InternalServerErrorException(
        'Could not capture PayPal payment',
      );
    }
  }
}
