import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '../../../entities/staffs.entity';
import { StaffAuthService } from './staff-auth.service';
import { StaffAuthController } from './staff-auth.controller';
import { MailService } from '../../../shared/services/mail.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [
    StaffAuthService,
    MailService,
    ApiKeyGuard,
    SubscriptionClientService,
  ],
  controllers: [StaffAuthController],
  exports: [
    StaffAuthService,
    MailService,
    ApiKeyGuard,
    SubscriptionClientService,
  ],
})
export class AuthSubmodule {}
