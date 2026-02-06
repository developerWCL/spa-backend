import {
  IsString,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { DayOffReason } from 'src/entities/staff-dayoff.entity';

export class CreateStaffDayoffDto {
  @IsDateString()
  date: string;

  @IsUUID()
  staffId: string;

  @IsEnum(DayOffReason)
  reason: DayOffReason;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateStaffDayoffDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsOptional()
  @IsEnum(DayOffReason)
  reason?: DayOffReason;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
