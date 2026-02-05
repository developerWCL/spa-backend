import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Branch' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'spa-uuid' })
  @IsNotEmpty()
  @IsUUID()
  spaId: string;

  @ApiProperty({ example: '123 Main St, City', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '+1-234-567-8900', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'branch@spa.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://spa.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateBranchDto {
  @ApiProperty({ example: 'Main Branch', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '123 Main St, City', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '+1-234-567-8900', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'branch@spa.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://spa.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;
}
