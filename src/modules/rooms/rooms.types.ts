import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus } from 'src/entities/enums/entity-room.enum';

export class CreateRoomDto {
  @ApiProperty({ example: 'branch-uuid' })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'Room 101' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Deluxe', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: '30 sqm', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 'AVAILABLE', enum: RoomStatus, required: false })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}

export class UpdateRoomDto {
  @ApiProperty({ example: 'Room 101', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Deluxe', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: '30 sqm', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 'AVAILABLE', enum: RoomStatus, required: false })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
