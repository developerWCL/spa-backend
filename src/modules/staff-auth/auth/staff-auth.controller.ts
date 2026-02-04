import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StaffAuthService } from './staff-auth.service';
import { LoginDto } from '../dto/login.dto';

@ApiTags('Staff Auth')
@Controller('staff-auth')
export class StaffAuthController {
  constructor(private readonly auth: StaffAuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT access token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('Missing credentials');
    }
    return this.auth.login(body.email, body.password);
  }
}
