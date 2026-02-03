import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SubscriptionClientService } from '../../shared/subscription-client.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, SubscriptionClientService],
  exports: [AuthService],
})
export class AuthModule {}
