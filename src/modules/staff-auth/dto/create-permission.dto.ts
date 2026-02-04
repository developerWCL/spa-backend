import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'manage:roles' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
