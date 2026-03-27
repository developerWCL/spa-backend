import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsString,
} from 'class-validator';

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
  @IsString()
  overrideStartDate?: string;

  @IsOptional()
  @IsString()
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
