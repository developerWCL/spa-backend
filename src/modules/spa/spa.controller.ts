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
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { SpaService } from './spa.service';
import { CreateSpaDto } from './spa.types';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

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
  @UseGuards(ApiKeyGuard)
  me(@Headers() headers: Record<string, string>) {
    console.log('Headers received:', headers);

    const spaId = headers['spa-id'];
    if (!spaId || Array.isArray(spaId)) {
      throw new BadRequestException('Missing or invalid spa-id header');
    }
    return this.spaService.findOne(spaId);
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
