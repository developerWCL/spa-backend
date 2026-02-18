import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';

export class PackageTranslationDto {
  @ApiProperty({ description: 'Language code (e.g., en, th)' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Package name in specified language' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Package description in specified language',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePackageDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsString()
  @IsUUID()
  branchId: string;

  @ApiProperty({ description: 'Package name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Package price' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiProperty({ description: 'Package start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Package end date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    enum: EntityStatus,
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiProperty({
    type: [String],
    description:
      'Sub-service IDs (minimum 1, maximum 10). Only active sub-services will be included.',
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1, {
    message: 'Package must have at least 1 sub-service',
  })
  @ArrayMaxSize(10, {
    message: 'Package can have at most 10 sub-services',
  })
  subServiceIds: string[];

  @ApiPropertyOptional({
    type: [PackageTranslationDto],
    description: 'Package translations',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageTranslationDto)
  @IsArray()
  translations?: PackageTranslationDto[];

  @ApiPropertyOptional({ description: 'Media IDs for package images' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];
}

export class UpdatePackageDto {
  @ApiPropertyOptional({ description: 'Package name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Package price' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Package start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Package end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: EntityStatus,
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Sub-service IDs (minimum 1 if provided, maximum 10). Only active sub-services will be included.',
    minItems: 1,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1, {
    message: 'Package must have at least 1 sub-service',
  })
  @ArrayMaxSize(10, {
    message: 'Package can have at most 10 sub-services',
  })
  subServiceIds?: string[];

  @ApiPropertyOptional({
    type: [PackageTranslationDto],
    description: 'Package translations',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageTranslationDto)
  @IsArray()
  translations?: PackageTranslationDto[];

  @ApiPropertyOptional({ description: 'Media IDs for package images' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];
}
