import { Module } from '@nestjs/common';
import { SubscriptionClientService } from './subscription-client.service';

@Module({
  providers: [SubscriptionClientService],
  exports: [SubscriptionClientService],
})
export class SubscriptionClientModule {}
