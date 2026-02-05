import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ example: 'success' })
  message: string;
}
