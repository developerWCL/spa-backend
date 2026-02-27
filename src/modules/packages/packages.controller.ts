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
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './packages.types';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { PaginationParams } from 'src/shared/pagination.types';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';

@Controller('packages')
@ApiBearerAuth()
@ApiTags('📦 Packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @ApiOperation({
    summary: 'Create a new package with sub-services',
    description:
      'Create a package with 1-10 sub-services. Only active sub-services will be included.',
  })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa ID to which the package belongs',
    required: false,
  })
  create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all packages for a branch',
    description:
      'Get all packages for a specific branch with filtering and pagination. Sub-services are filtered to show only active ones.',
  })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa ID to which the package belongs',
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
    description: 'Search by package name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EntityStatus,
    description: 'Filter by package status',
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
    description: 'Items per page (default: 10)',
  })
  findAll(
    @Query('branchId') branchId: string,
    @Query('search') search?: string,
    @Query('status') status?: EntityStatus,
    @Query() paginationParams?: PaginationParams,
  ) {
    return this.packagesService.findAll(
      branchId,
      { search, status },
      paginationParams,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific package',
    description:
      'Retrieve details of a specific package including its sub-services.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Package ID',
  })
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @ApiOperation({
    summary: 'Update a package',
    description:
      'Update package details and sub-services. At least 1 sub-service must remain after update. Only active sub-services can be added.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Package ID',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @ApiOperation({
    summary: 'Delete a package',
    description: 'Permanently delete a package and its associations.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Package ID',
  })
  delete(@Param('id') id: string) {
    return this.packagesService.delete(id);
  }

  @Get(':id/active-services')
  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @ApiOperation({
    summary: 'Get active sub-services for a package',
    description: 'Retrieve only the active sub-services included in a package.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Package ID',
  })
  getActiveSubServices(@Param('id') id: string) {
    return this.packagesService.getActiveSubServices(id);
  }
}
