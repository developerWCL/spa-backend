import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Booking } from 'src/entities/bookings.entity';
import { Payment } from 'src/entities/payments.entity';
import { Customer } from 'src/entities/customers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Payment, Customer])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
