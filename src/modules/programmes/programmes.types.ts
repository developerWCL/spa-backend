import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';

export class ProgrammeTranslationDto {
  @ApiProperty({ description: 'Language code (e.g., en, th)' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Programme name in specified language' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Programme description in specified language',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ProgrammeStepTranslationDto {
  @ApiProperty({ description: 'Language code (e.g., en, th)' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Step title in specified language' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Step description in specified language',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ProgrammeStepDto {
  @ApiPropertyOptional({ description: 'Step ID (required for updates)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Step title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Step description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Translations for this step',
    type: [ProgrammeStepTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgrammeStepTranslationDto)
  translations?: ProgrammeStepTranslationDto[];
}

export class CreateProgrammeDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Programme name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Programme description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Maximum concurrent bookings allowed' })
  @IsOptional()
  @IsNumber()
  maxConcurrentBookings?: number;

  @ApiPropertyOptional({ description: 'Maximum bookings per day' })
  @IsOptional()
  @IsNumber()
  maxBookingsPerDay?: number;

  //status
  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({
    description: 'Translations for this programme',
    type: [ProgrammeTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgrammeTranslationDto)
  translations?: ProgrammeTranslationDto[];

  @ApiPropertyOptional({
    description: 'Steps in this programme',
    type: [ProgrammeStepDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgrammeStepDto)
  steps?: ProgrammeStepDto[];

  @ApiPropertyOptional({
    description: 'Media IDs to associate with this programme',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  mediaIds?: string[];
}

export class UpdateProgrammeDto {
  @ApiPropertyOptional({ description: 'Programme name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Programme description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsString()
  price?: string;

  //status
  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
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
    description: 'Translations for this programme',
    type: [ProgrammeTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgrammeTranslationDto)
  translations?: ProgrammeTranslationDto[];

  @ApiPropertyOptional({
    description: 'Steps in this programme',
    type: [ProgrammeStepDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgrammeStepDto)
  steps?: ProgrammeStepDto[];

  @ApiPropertyOptional({
    description: 'Media IDs to associate with this programme',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  mediaIds?: string[];
}
