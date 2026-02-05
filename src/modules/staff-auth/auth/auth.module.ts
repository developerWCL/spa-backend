import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '../../../entities/staffs.entity';
import { StaffAuthService } from './staff-auth.service';
import { StaffAuthController } from './staff-auth.controller';
import { MailService } from '../../../shared/services/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [StaffAuthService, MailService],
  controllers: [StaffAuthController],
  exports: [StaffAuthService, MailService],
})
export class AuthSubmodule {}
