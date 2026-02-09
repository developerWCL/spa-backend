import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './services.types';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Controller('services')
@UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new service with translations and sub-services',
  })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all services for a branch' })
  findAll(@Query('branchId') branchId: string) {
    return this.servicesService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID with all relations' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update service with translations and sub-services',
  })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Delete('sub-services/:subServiceId')
  @ApiOperation({ summary: 'Delete sub-service' })
  removeSubService(@Param('subServiceId') subServiceId: string) {
    return this.servicesService.removeSubService(subServiceId);
  }
}
