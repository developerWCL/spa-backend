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
  Header,
  Headers,
} from '@nestjs/common';
import { PriceOverridesService } from './price-overrides.service';
import {
  CreatePriceOverrideDto,
  UpdatePriceOverrideDto,
} from './price-overrides.types';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { PaginationParams } from 'src/shared/pagination.types';

@Controller('price-overrides')
// @UseGuards(StaffJwtAuthGuard)
@ApiBearerAuth()
export class PriceOverridesController {
  constructor(private readonly priceOverridesService: PriceOverridesService) {}

  @UseGuards(StaffJwtAuthGuard)
  @Post()
  @ApiOperation({
    summary:
      'Create a new price override for a sub-service, package, or programme',
  })
  create(@Body() dto: CreatePriceOverrideDto) {
    return this.priceOverridesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all price overrides with optional filtering',
  })
  @ApiQuery({
    name: 'subServiceId',
    required: false,
    type: 'string',
    description: 'Filter by sub-service ID',
  })
  @ApiQuery({
    name: 'packageId',
    required: false,
    type: 'string',
    description: 'Filter by package ID',
  })
  @ApiQuery({
    name: 'programmeId',
    required: false,
    type: 'string',
    description: 'Filter by programme ID',
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Headers('branchId') branchId?: string,
  ) {
    return this.priceOverridesService.findAll({
      startDate,
      endDate,
      search,
      branchId,
    });
  }

  @Get('sub-service/:subServiceId')
  @ApiOperation({
    summary: 'Get all price overrides for a specific sub-service',
  })
  @ApiParam({
    name: 'subServiceId',
    type: 'string',
    description: 'Sub-service ID',
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
  findBySubService(
    @Param('subServiceId') subServiceId: string,
    @Query() paginationParams?: PaginationParams,
  ) {
    return this.priceOverridesService.findBySubService(
      subServiceId,
      paginationParams,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a price override by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Price override ID',
  })
  findOne(@Param('id') id: string) {
    return this.priceOverridesService.findOne(id);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a price override' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Price override ID',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePriceOverrideDto) {
    return this.priceOverridesService.update(id, dto);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a price override (soft delete)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Price override ID',
  })
  remove(@Param('id') id: string) {
    return this.priceOverridesService.remove(id);
  }
}
