import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { SpaService } from './spa.service';
import { CreateSpaDto } from './spa.types';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Controller('spas')
export class SpaController {
  constructor(private readonly spaService: SpaService) {}

  @Post()
  create(@Body() body: CreateSpaDto) {
    return this.spaService.create(body);
  }

  @Get()
  findAll() {
    return this.spaService.findAll();
  }

  // Tenant-aware endpoint example: returns the subscription validated by JWT
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { subscription?: { companyId?: string } }) {
    const companyId = req.subscription?.companyId;
    if (!companyId) {
      throw new BadRequestException('Missing companyId in subscription');
    }

    return this.spaService.findByCompanyId(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spaService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: CreateSpaDto) {
    return this.spaService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spaService.remove(id);
  }
}
