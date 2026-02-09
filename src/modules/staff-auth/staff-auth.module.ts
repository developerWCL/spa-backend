import { Module } from '@nestjs/common';
import { AuthSubmodule } from './auth/auth.module';
import { RolesSubmodule } from './roles/roles.module';
import { StaffSubmodule } from './staff/staff.module';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Module({
  imports: [AuthSubmodule, RolesSubmodule, StaffSubmodule],
  providers: [SubscriptionClientService, ApiKeyGuard],
  exports: [
    AuthSubmodule,
    RolesSubmodule,
    StaffSubmodule,
    SubscriptionClientService,
    ApiKeyGuard,
  ],
})
export class StaffAuthModule {}
