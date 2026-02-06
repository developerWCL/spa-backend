import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffDayoffService } from './staff-dayoff.service';
import { StaffDayoffController } from './staff-dayoff.controller';
import { StaffDayoff } from 'src/entities/staff-dayoff.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([StaffDayoff]), StaffAuthModule],
  providers: [StaffDayoffService],
  controllers: [StaffDayoffController],
  exports: [StaffDayoffService],
})
export class StaffDayoffModule {}
