import { Module } from '@nestjs/common';
import { AuthSubmodule } from './auth/auth.module';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { CustomerSubmodule } from './customer/customer.module';

@Module({
  imports: [AuthSubmodule, CustomerSubmodule],
  providers: [SubscriptionClientService, ApiKeyGuard],
  exports: [
    AuthSubmodule,
    CustomerSubmodule,
    SubscriptionClientService,
    ApiKeyGuard,
  ],
})
export class CustomerAuthModule {}
