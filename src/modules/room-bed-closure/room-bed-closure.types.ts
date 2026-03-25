import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomBedClosureDto {
  @ApiProperty({
    example: 'room-uuid',
    description: 'Room ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({
    example: 'bed-uuid',
    description: 'Bed ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  bedId?: string;

  @ApiProperty({
    example: '2024-12-25T00:00:00Z',
    description: 'Closure date',
  })
  @IsNotEmpty()
  @IsDateString()
  closureDate: string;

  @ApiProperty({
    example: 'Maintenance',
    description: 'Reason for closure',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateRoomBedClosureDto {
  @ApiProperty({
    example: 'room-uuid',
    description: 'Room ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({
    example: 'bed-uuid',
    description: 'Bed ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  bedId?: string;

  @ApiProperty({
    example: '2024-12-25T00:00:00Z',
    description: 'Closure date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  closureDate?: string;

  @ApiProperty({
    example: 'Maintenance',
    description: 'Reason for closure',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
