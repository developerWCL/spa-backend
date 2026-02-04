import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { StaffJwtAuthGuard } from '../guards/staff-jwt.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../guards/permissions.decorator';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly svc: RolesService) {}

  @ApiOperation({ summary: 'List all roles' })
  @Get('roles')
  @Permissions('manage:roles')
  listRoles() {
    return this.svc.listRoles();
  }

  @ApiOperation({ summary: 'Create a new role' })
  @Post('roles')
  @Permissions('manage:roles')
  createRole(@Body() body: CreateRoleDto) {
    return this.svc.createRole(body);
  }

  @ApiOperation({ summary: 'List all permissions' })
  @Get('permissions')
  @Permissions('manage:roles')
  listPermissions() {
    return this.svc.listPermissions();
  }

  @ApiOperation({ summary: 'Create a new permission' })
  @Post('permissions')
  @Permissions('manage:roles')
  createPermission(@Body() body: CreatePermissionDto) {
    return this.svc.createPermission(body);
  }
}
