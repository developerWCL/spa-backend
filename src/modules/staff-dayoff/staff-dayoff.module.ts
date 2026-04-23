import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffDayoffService } from './staff-dayoff.service';
import { StaffDayoffController } from './staff-dayoff.controller';
import { StaffDayoff } from 'src/entities/staff-dayoff.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { LoggingModule } from 'src/core/logging/logging.module';
import { Staff } from 'src/entities/staffs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffDayoff, Staff]),
    StaffAuthModule,
    LoggingModule,
  ],
  providers: [StaffDayoffService],
  controllers: [StaffDayoffController],
  exports: [StaffDayoffService],
})
export class StaffDayoffModule {}
