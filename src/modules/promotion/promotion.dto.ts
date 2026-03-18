import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumberString,
  IsDateString,
  IsInt,
  IsArray,
} from 'class-validator';
import {
  PromotionActiveDay,
  PromotionDayActivated,
  PromotionDiscountType,
} from '../../entities/enums/entity-promotion.enum';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PromotionDiscountType)
  discountType: PromotionDiscountType;

  @IsOptional()
  @IsNumberString()
  discountValue?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumberString()
  minPurchaseAmount?: string;

  @IsOptional()
  @IsInt()
  maxUsed?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(PromotionActiveDay, { each: true })
  activeDays?: PromotionActiveDay[];

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  autoApply?: boolean;

  @IsOptional()
  @IsEnum(PromotionDayActivated)
  dayActivated?: PromotionDayActivated;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PromotionDiscountType)
  discountType?: PromotionDiscountType;

  @IsOptional()
  @IsNumberString()
  discountValue?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumberString()
  minPurchaseAmount?: string;

  @IsOptional()
  @IsInt()
  maxUsed?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(PromotionActiveDay, { each: true })
  activeDays?: PromotionActiveDay[];

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  autoApply?: boolean;

  @IsOptional()
  @IsEnum(PromotionDayActivated)
  dayActivated?: PromotionDayActivated;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}
