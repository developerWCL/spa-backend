import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';

export class ServiceTranslationDto {
  @ApiProperty({ description: 'Language code (e.g., en, th)' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Service name in specified language' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Service description in specified language',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SubServiceDto {
  @ApiPropertyOptional({ description: 'Sub-service ID (required for updates)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Sub-service name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({
    enum: EntityStatus,
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({ description: 'Maximum concurrent bookings allowed' })
  @IsOptional()
  @IsNumber()
  maxConcurrentBookings?: number;

  @ApiPropertyOptional({ description: 'Maximum bookings per day' })
  @IsOptional()
  @IsNumber()
  maxBookingsPerDay?: number;

  @ApiPropertyOptional({
    type: [ServiceTranslationDto],
    description: 'Sub-service translations',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  @IsArray()
  translations?: ServiceTranslationDto[];
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsString()
  branchId: string;

  @ApiPropertyOptional({ description: 'Service category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Service name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Base price' })
  @IsOptional()
  @IsString()
  basePrice?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({
    enum: EntityStatus,
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({ description: 'Maximum concurrent bookings allowed' })
  @IsOptional()
  @IsNumber()
  maxConcurrentBookings?: number;

  @ApiPropertyOptional({ description: 'Maximum bookings per day' })
  @IsOptional()
  @IsNumber()
  maxBookingsPerDay?: number;

  @ApiPropertyOptional({
    type: [ServiceTranslationDto],
    description: 'Service translations for multiple languages',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  @IsArray()
  translations?: ServiceTranslationDto[];

  @ApiPropertyOptional({
    type: [SubServiceDto],
    description: 'Sub-services with variants and pricing',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubServiceDto)
  @IsArray()
  subServices?: SubServiceDto[];
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'Service category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Service name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Base price' })
  @IsOptional()
  @IsString()
  basePrice?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({
    enum: EntityStatus,
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({ description: 'Maximum concurrent bookings allowed' })
  @IsOptional()
  @IsNumber()
  maxConcurrentBookings?: number;

  @ApiPropertyOptional({ description: 'Maximum bookings per day' })
  @IsOptional()
  @IsNumber()
  maxBookingsPerDay?: number;

  @ApiPropertyOptional({
    type: [ServiceTranslationDto],
    description: 'Service translations for multiple languages',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  @IsArray()
  translations?: ServiceTranslationDto[];

  @ApiPropertyOptional({
    type: [SubServiceDto],
    description: 'Sub-services with variants and pricing',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubServiceDto)
  @IsArray()
  subServices?: SubServiceDto[];
}
