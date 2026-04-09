import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class QueryLogsDto {
  @IsOptional()
  @IsEnum(['error', 'warn', 'debug', 'log', 'verbose'])
  level?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  spaId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class IngestLogDto {
  @IsString()
  level: string;

  @IsString()
  context: string;

  @IsString()
  message: string;

  @IsOptional()
  meta?: Record<string, any>;

  @IsOptional()
  @IsString()
  spaId?: string;
}
