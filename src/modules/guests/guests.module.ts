import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { Guest } from 'src/entities/guests.entity';
import { Customer } from 'src/entities/customers.entity';
import { Spa } from 'src/entities/spa.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { LoggingModule } from 'src/core/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guest, Customer, Spa]),
    StaffAuthModule,
    LoggingModule,
  ],
  controllers: [GuestsController],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}
