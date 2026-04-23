import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from 'src/entities/customers.entity';
import { Spa } from 'src/entities/spa.entity';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { AdminCustomerController } from './admin-customer.controller';
import { RolesSubmodule } from '../../../modules/staff-auth/roles/roles.module';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { StaffJwtAuthGuard } from '../../../guards/staff-jwt.guard';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { LoggingModule } from 'src/core/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Spa]),
    RolesSubmodule,
    LoggingModule,
  ],
  providers: [
    CustomerService,
    PermissionsGuard,
    StaffJwtAuthGuard,
    SubscriptionClientService,
    ApiKeyGuard,
  ],
  controllers: [CustomerController, AdminCustomerController],
  exports: [CustomerService],
})
export class CustomerSubmodule {}
