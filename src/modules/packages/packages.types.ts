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
  IsNumber,
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

export class SubServiceTranslationDto {
  @ApiProperty({ description: 'Language code (e.g., en, th)' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Sub-service name in specified language' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Sub-service description in specified language',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateNewSubServiceDto {
  @ApiProperty({ description: 'Service ID to associate this sub-service with' })
  @IsString()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Sub-service name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiProperty({ description: 'Price for this sub-service' })
  @IsString()
  price: string;

  @ApiPropertyOptional({
    enum: EntityStatus,
    description: 'Status: active or inactive',
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({
    type: [SubServiceTranslationDto],
    description: 'Sub-service translations',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubServiceTranslationDto)
  @IsArray()
  translations?: SubServiceTranslationDto[];
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
      'Sub-service IDs to link to this package (minimum 1 combined with newSubServices, maximum 10 total).',
    minItems: 0,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMaxSize(10, {
    message: 'Package can have at most 10 sub-services total',
  })
  subServiceIds?: string[];

  @ApiPropertyOptional({
    type: [CreateNewSubServiceDto],
    description:
      'New sub-services to create and associate with this package (minimum 1 combined with subServiceIds, maximum 10 total).',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateNewSubServiceDto)
  @IsArray()
  newSubServices?: CreateNewSubServiceDto[];

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
      'Sub-service IDs to link to this package (minimum 1 combined with newSubServices, maximum 10 total).',
    minItems: 0,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMaxSize(10, {
    message: 'Package can have at most 10 sub-services total',
  })
  subServiceIds?: string[];

  @ApiPropertyOptional({
    type: [CreateNewSubServiceDto],
    description:
      'New sub-services to create and associate with this package (minimum 1 combined with subServiceIds, maximum 10 total).',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateNewSubServiceDto)
  @IsArray()
  newSubServices?: CreateNewSubServiceDto[];

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
