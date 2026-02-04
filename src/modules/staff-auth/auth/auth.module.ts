import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '../../../entities/staffs.entity';
import { StaffAuthService } from './staff-auth.service';
import { StaffAuthController } from './staff-auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [StaffAuthService],
  controllers: [StaffAuthController],
  exports: [StaffAuthService],
})
export class AuthSubmodule {}
