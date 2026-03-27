import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsArray,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CartStatus, CartItemType } from 'src/entities/enums/cart.enum';
import { EntityGuestGender } from 'src/entities/enums/entity-guest.enum';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'Type of item',
    enum: CartItemType,
  })
  @IsEnum(CartItemType)
  itemType: CartItemType;

  @ApiPropertyOptional({ description: 'Sub-service ID' })
  @IsOptional()
  @IsUUID()
  subServiceId?: string;

  @ApiPropertyOptional({ description: 'Package ID' })
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiPropertyOptional({ description: 'Programme ID' })
  @IsOptional()
  @IsUUID()
  programmeId?: string;

  @ApiPropertyOptional({ description: 'Quantity (default: 1)' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Scheduled date for booking',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiPropertyOptional({
    description: 'Scheduled time for booking',
    format: 'time',
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GuestDto {
  @ApiPropertyOptional({
    description: 'Guest ID (for updating existing guest)',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Guest first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Guest last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Guest email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Guest phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Guest nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Guest gender',
    enum: EntityGuestGender,
  })
  @IsOptional()
  @IsEnum(EntityGuestGender)
  gender?: EntityGuestGender;

  @ApiPropertyOptional({ description: 'Guest special request' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}

export class UpdateCartItemDto {
  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Sub-service ID' })
  @IsOptional()
  @IsUUID()
  subServiceId?: string;

  @ApiPropertyOptional({ description: 'Package ID' })
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiPropertyOptional({ description: 'Programme ID' })
  @IsOptional()
  @IsUUID()
  programmeId?: string;

  @ApiPropertyOptional({
    description: 'Scheduled date for booking',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiPropertyOptional({
    description: 'Scheduled time for booking',
    format: 'time',
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Guest information' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  guests?: GuestDto[];

  @ApiPropertyOptional({ description: 'Price for this item' })
  @IsOptional()
  @IsString()
  price?: string;
}

export class CreateCartDto {
  @ApiPropertyOptional({ description: 'Notes for the cart' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Initial items to add to cart',
    type: [CreateCartItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items?: CreateCartItemDto[];
}

export class UpdateCartDto {
  @ApiPropertyOptional({ description: 'Cart status', enum: CartStatus })
  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;

  @ApiPropertyOptional({ description: 'Notes for the cart' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddToCartDto {
  @ApiProperty({
    description: 'Type of item',
    enum: CartItemType,
  })
  @IsEnum(CartItemType)
  itemType: CartItemType;

  @ApiPropertyOptional({ description: 'Sub-service ID' })
  @IsOptional()
  @IsUUID()
  subServiceId?: string;

  @ApiPropertyOptional({ description: 'Package ID' })
  @IsOptional()
  @IsUUID()
  packageId?: string;

  @ApiPropertyOptional({ description: 'Programme ID' })
  @IsOptional()
  @IsUUID()
  programmeId?: string;

  @ApiPropertyOptional({ description: 'Quantity (default: 1)' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Price for this item' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({
    description: 'Scheduled date for booking',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiPropertyOptional({
    description: 'Scheduled time for booking',
    format: 'time',
  })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Guest information' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  guests?: GuestDto[];
}
