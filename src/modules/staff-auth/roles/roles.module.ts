import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';
import { Staff } from '../../../entities/staffs.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthorizationService } from './authorization.service';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, Staff])],
  providers: [
    RolesService,
    AuthorizationService,
    PermissionsGuard,
    SubscriptionClientService,
    ApiKeyGuard,
  ],
  controllers: [RolesController],
  exports: [
    AuthorizationService,
    PermissionsGuard,
    RolesService,
    SubscriptionClientService,
    ApiKeyGuard,
  ],
})
export class RolesSubmodule {}
