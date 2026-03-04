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
import {
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { PaginationParams } from 'src/shared/pagination.types';

@Controller('services')
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Post()
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @ApiOperation({
    summary: 'Create a new service with translations and sub-services',
  })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa/branch ID',
    required: false,
  })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all services for a branch with filtering and pagination',
  })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa/branch ID',
    required: false,
  })
  @ApiQuery({
    name: 'branchId',
    required: true,
    type: 'string',
    description: 'Branch ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by service name or description',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: 'string',
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page (default: 10, max: 100)',
  })
  findAll(
    @Query('branchId') branchId: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const paginationParams: PaginationParams =
      page || limit
        ? {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
          }
        : undefined;
    return this.servicesService.findAll(
      branchId,
      { search, categoryId },
      paginationParams,
    );
  }

  @Get('categories/all/:branchId')
  @ApiOperation({ summary: 'Get all service categories for a branch' })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa/branch ID',
    required: false,
  })
  getServiceCategories(@Param('branchId') branchId: string) {
    return this.servicesService.getServiceCategories(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID with all relations' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Update service with translations and sub-services',
  })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @Delete('sub-services/:subServiceId')
  @ApiOperation({ summary: 'Delete sub-service' })
  removeSubService(@Param('subServiceId') subServiceId: string) {
    return this.servicesService.removeSubService(subServiceId);
  }

  @Get(':id/bookings/count')
  @ApiOperation({
    summary: 'Get count of bookings for a service grouped by date or hour',
  })
  @ApiQuery({
    name: 'serviceType',
    required: true,
    type: 'string',
    description: 'Type of service',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: 'string',
    description: 'Start date filter (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: 'string',
    description: 'End date filter (ISO format)',
  })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    enum: ['day', 'hour'],
    description: 'Group bookings by day or hour (default: day)',
  })
  countBookingsByServiceAndTime(
    @Param('id') serviceId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'hour',
    @Query('serviceType') serviceType?: 'services' | 'packages' | 'programs',
  ) {
    return this.servicesService.countBookingsByServiceAndTime({
      serviceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy: groupBy || 'day',
      serviceType: serviceType || 'services',
    });
  }
}
