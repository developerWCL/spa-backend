import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedsService } from './beds.service';
import { BedsController } from './beds.controller';
import { Bed } from 'src/entities/beds.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bed]), StaffAuthModule],
  providers: [BedsService],
  controllers: [BedsController],
  exports: [BedsService],
})
export class BedsModule {}
