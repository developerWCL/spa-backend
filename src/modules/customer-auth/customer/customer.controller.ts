import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from 'src/modules/staff-auth/guards/jwt-auth.guard';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('profile')
  async getProfile(@Req() req) {
    return this.customerService.findById(req.user.sub);
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() dto: Partial<any>) {
    return this.customerService.update(req.user.sub, dto);
  }

  @Delete('profile')
  async deleteProfile(@Req() req) {
    return this.customerService.delete(req.user.sub);
  }

  @Get()
  async findAll() {
    return this.customerService.findAll();
  }
}
