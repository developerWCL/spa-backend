import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-xyz' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newPassword123!' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
