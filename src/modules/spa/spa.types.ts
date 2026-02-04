export type SpaStatus = 'active' | 'inactive';

export interface ISpa {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status?: SpaStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

import { Expose } from 'class-transformer';

export class CreateSpaDto {
  name: string;

  @Expose({ name: 'company_id' })
  companyId: string;

  @Expose({ name: 'company_name' })
  companyName?: string;

  @Expose({ name: 'billing_email' })
  billingEmail?: string;

  phone?: string;
  email?: string;
  website?: string;
  status?: SpaStatus;
}

export type UpdateSpaDto = Partial<CreateSpaDto>;
