import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Headers,
  Query,
} from '@nestjs/common';
import { StaffDayoffService } from './staff-dayoff.service';
import {
  CreateStaffDayoffDto,
  UpdateStaffDayoffDto,
} from './staff-dayoff.types';
import { Permissions } from 'src/decorator/permissions.decorator';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { PaginationParams } from 'src/shared/pagination.types';

@Controller('staff-dayoff')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffDayoffController {
  constructor(private readonly staffDayoffService: StaffDayoffService) {}

  @Post()
  @Permissions('manage:staff_dayoff')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Create a new staff dayoff' })
  @ApiHeader({ name: 'branchId', description: 'Branch ID' })
  create(@Body() dto: CreateStaffDayoffDto) {
    return this.staffDayoffService.create(dto);
  }

  @Get()
  @Permissions('view:staff_dayoff')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get all staff dayoffs' })
  @ApiHeader({
    name: 'branchId',
    description: 'Optional branch ID for filtering',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by staff name',
  })
  findAll(
    @Headers('branchId') headerBranchId?: string,
    @Query('branchId') queryBranchId?: string,
    @Query('search') search?: string,
    @Query() paginationParams?: PaginationParams,
  ) {
    const branchId = queryBranchId || headerBranchId;
    return this.staffDayoffService.findAll(branchId, paginationParams, {
      search,
    });
  }

  @Get('staff/:staffId')
  @Permissions('view:staff_dayoff')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get all dayoffs for a specific staff' })
  @ApiHeader({
    name: 'branchId',
    description: 'Optional branch ID for filtering',
  })
  findByStaffId(
    @Param('staffId') staffId: string,
    @Headers('branchId') branchId?: string,
  ) {
    return this.staffDayoffService.findByStaffId(staffId, branchId);
  }

  @Get(':id')
  @Permissions('view:staff_dayoff')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Get staff dayoff by id' })
  @ApiHeader({
    name: 'branchId',
    description: 'Optional branch ID for filtering',
  })
  findOne(@Param('id') id: string, @Headers('branchId') branchId?: string) {
    return this.staffDayoffService.findOne(id, branchId);
  }

  @Put(':id')
  @Permissions('manage:staff_dayoff')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Update a staff dayoff' })
  @ApiHeader({ name: 'branchId', description: 'Branch ID' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDayoffDto,
    @Headers('branchId') branchId?: string,
  ) {
    return this.staffDayoffService.update(id, dto, branchId);
  }

  @Delete(':id')
  @Permissions('manage:staff_dayoff')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Delete a staff dayoff' })
  @ApiHeader({ name: 'branchId', description: 'Branch ID' })
  remove(@Param('id') id: string, @Headers('branchId') branchId?: string) {
    return this.staffDayoffService.remove(id, branchId);
  }
}
