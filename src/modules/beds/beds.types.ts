import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BedType, RoomStatus } from 'src/entities/enums/entity-room.enum';

export class CreateBedDto {
  @ApiProperty({ example: 'room-uuid', required: false })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'Bed A' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'BED-001', required: false })
  @IsOptional()
  @IsString()
  bedId?: string;

  @ApiProperty({ example: 'BED', enum: BedType, required: false })
  @IsOptional()
  @IsEnum(BedType)
  type?: BedType;

  @ApiProperty({ example: 'AVAILABLE', enum: RoomStatus, required: false })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}

export class UpdateBedDto {
  @ApiProperty({ example: 'Bed A', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'BED-001', required: false })
  @IsOptional()
  @IsString()
  bedId?: string;

  @ApiProperty({ example: 'room-uuid', required: false })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiProperty({ example: 'BED', enum: BedType, required: false })
  @IsOptional()
  @IsEnum(BedType)
  type?: BedType;

  @ApiProperty({ example: 'AVAILABLE', enum: RoomStatus, required: false })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
