import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Headers,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffJwtAuthGuard } from '../../../guards/staff-jwt.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { Permissions } from '../../../decorator/permissions.decorator';
import { BranchGuard } from '../guards/branch.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../decorator/current-user.decorator';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { PaginationParams } from '../../../shared/pagination.types';

@ApiTags('Staff Management')
@ApiBearerAuth()
@Controller('admin/staffs')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class StaffsController {
  constructor(private readonly svc: StaffsService) {}

  @ApiOperation({ summary: 'List all staff' })
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
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: 'boolean',
    description: 'Filter by active status (true/false, omit for all)',
  })
  @Get()
  @Permissions('manage:staffs')
  @UseGuards(ApiKeyGuard)
  list(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() paginationParams: PaginationParams,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Headers('branchId') branchId?: string,
  ) {
    // Parse isActive from query string
    let isActiveFilter: boolean | undefined;
    if (isActive !== undefined) {
      isActiveFilter = isActive === 'true';
    }

    // If branchId is provided in header, filter by that specific branch
    if (branchId) {
      return this.svc.list(paginationParams, [branchId], currentUser.spaIds, {
        search,
        isActive: isActiveFilter,
      });
    }
    // Otherwise, list all staffs for user's branches
    return this.svc.list(
      paginationParams,
      currentUser.branchIds,
      currentUser.spaIds,
      { search, isActive: isActiveFilter },
    );
  }

  @ApiOperation({ summary: 'Get a staff by ID' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @Get(':id')
  @Permissions('manage:staffs')
  @UseGuards(BranchGuard, ApiKeyGuard)
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @ApiOperation({ summary: 'Create a new staff' })
  @Post()
  @Permissions('manage:staffs')
  @UseGuards(ApiKeyGuard)
  create(
    @Body() body: CreateStaffDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.svc.create(body, currentUser.branchIds, currentUser.spaIds);
  }

  @ApiOperation({ summary: 'Update a staff' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @Put(':id')
  @Permissions('manage:staffs')
  @UseGuards(BranchGuard, ApiKeyGuard)
  update(@Param('id') id: string, @Body() body: UpdateStaffDto) {
    return this.svc.update(id, body);
  }

  @ApiOperation({ summary: 'Delete a staff (soft delete)' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @Delete(':id')
  @Permissions('manage:staffs')
  @UseGuards(BranchGuard, ApiKeyGuard)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
