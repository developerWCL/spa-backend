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
@UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
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
