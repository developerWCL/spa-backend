import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityGuestGender } from 'src/entities/enums/entity-guest.enum';

export class CreateGuestDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Thailand', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({
    example: 'MALE',
    enum: EntityGuestGender,
    required: false,
  })
  @IsOptional()
  @IsEnum(EntityGuestGender)
  gender?: EntityGuestGender;

  @ApiProperty({ example: 'spa-uuid', required: false })
  @IsOptional()
  @IsUUID()
  spaId?: string;

  @ApiProperty({ example: 'customer-uuid', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}

export class UpdateGuestDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Thailand', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({
    example: 'MALE',
    enum: EntityGuestGender,
    required: false,
  })
  @IsOptional()
  @IsEnum(EntityGuestGender)
  gender?: EntityGuestGender;

  @ApiProperty({ example: 'customer-uuid', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
