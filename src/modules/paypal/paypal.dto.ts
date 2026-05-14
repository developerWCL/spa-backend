import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { PaypalMode } from 'src/entities/enums/paypal.enum';

// ── Customer-facing: create PayPal order ──

export class CreatePaypalOrderDto {
  @IsNotEmpty()
  @IsString()
  branchId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  customerFirstName: string;

  @IsNotEmpty()
  @IsString()
  customerLastName: string;

  @IsOptional()
  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsNotEmpty()
  @IsString()
  spaId: string;

  @IsOptional()
  @IsString()
  currency?: string;

  // Full booking payload — stored temporarily until capture
  @IsNotEmpty()
  bookingPayload: Record<string, any>;

  @IsOptional()
  bookingItems?: Record<string, any>[];

  @IsOptional()
  @IsString()
  invoiceId?: string;
}

// ── Admin: PayPal account CRUD ──

export class CreatePaypalAccountDto {
  @IsNotEmpty()
  @IsString()
  spaId: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  clientSecret: string;

  @IsOptional()
  @IsString()
  webhookId?: string;

  @IsEnum(PaypalMode)
  mode: PaypalMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  branchIds?: string[];
}

export class UpdatePaypalAccountDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  webhookId?: string;

  @IsOptional()
  @IsEnum(PaypalMode)
  mode?: PaypalMode;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignBranchesDto {
  @IsArray()
  @IsString({ each: true })
  branchIds: string[];
}

// ── Webhook ──

export class PaypalWebhookDto {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    custom_id?: string;
    purchase_units?: Array<{
      reference_id: string;
      custom_id?: string;
      amount: { value: string; currency_code: string };
    }>;
  };
}
