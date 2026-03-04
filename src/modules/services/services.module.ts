import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from 'src/entities/services.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { ServiceTranslation } from 'src/entities/service_translations.entity';
import { SubServiceTranslation } from 'src/entities/sub_service_translations.entity';
import { Branch } from 'src/entities/branch.entity';
import { ServiceCategory } from 'src/entities/service_categories.entity';
import { Media } from 'src/entities/media.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { Booking } from 'src/entities/bookings.entity';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      SubService,
      ServiceTranslation,
      SubServiceTranslation,
      Branch,
      ServiceCategory,
      Media,
      Booking,
      Package,
      Programme,
    ]),
    StaffAuthModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
