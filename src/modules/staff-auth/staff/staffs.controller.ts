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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
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

@ApiTags('Staff Management')
@ApiBearerAuth()
@Controller('admin/staffs')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class StaffsController {
  constructor(private readonly svc: StaffsService) {}

  @ApiOperation({ summary: 'List all staff' })
  @Get()
  @Permissions('manage:staffs')
  list(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.svc.list(currentUser.branchIds, currentUser.spaIds);
  }

  @ApiOperation({ summary: 'Get a staff by ID' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @Get(':id')
  @Permissions('manage:staffs')
  @UseGuards(BranchGuard)
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @ApiOperation({ summary: 'Create a new staff' })
  @Post()
  @Permissions('manage:staffs')
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
  @UseGuards(BranchGuard)
  update(@Param('id') id: string, @Body() body: UpdateStaffDto) {
    return this.svc.update(id, body);
  }

  @ApiOperation({ summary: 'Delete a staff (soft delete)' })
  @ApiParam({ name: 'id', description: 'Staff ID' })
  @Delete(':id')
  @Permissions('manage:staffs')
  @UseGuards(BranchGuard)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
