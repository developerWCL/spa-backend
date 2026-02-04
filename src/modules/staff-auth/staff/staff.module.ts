import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '../../../entities/staffs.entity';
import { Role } from '../../../entities/role.entity';
import { Branch } from '../../../entities/branch.entity';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { StaffJwtAuthGuard } from '../../../guards/staff-jwt.guard';
import { RolesSubmodule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, Role, Branch]), RolesSubmodule],
  providers: [StaffsService, PermissionsGuard, StaffJwtAuthGuard],
  controllers: [StaffsController],
  exports: [StaffsService],
})
export class StaffSubmodule {}
