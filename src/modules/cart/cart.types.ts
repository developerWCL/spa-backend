import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CartStatus, CartItemType } from 'src/entities/enums/cart.enum';

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
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCartItemDto {
  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Scheduled date for booking',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
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

  @ApiPropertyOptional({
    description: 'Scheduled date for booking',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}
