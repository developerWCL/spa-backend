import { IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreatePriceOverrideDto {
  @IsDateString()
  overrideStartDate: string;

  @IsDateString()
  overrideEndDate?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsUUID()
  subServiceId?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsUUID()
  programmeId?: string;
}

export class UpdatePriceOverrideDto {
  @IsOptional()
  @IsDateString()
  overrideStartDate?: string;

  @IsOptional()
  @IsDateString()
  overrideEndDate?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsUUID()
  subServiceId?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;

  @IsOptional()
  @IsUUID()
  programmeId?: string;
}
