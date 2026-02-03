export type SpaStatus = 'active' | 'inactive';

export interface ISpa {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  status?: SpaStatus;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export class CreateSpaDto {
  name: string;
  company_id: string;
  company_name?: string;
  billing_email?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: SpaStatus;
}

export type UpdateSpaDto = Partial<CreateSpaDto>;
