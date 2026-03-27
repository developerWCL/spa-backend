import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceOverridesService } from './price-overrides.service';
import { PriceOverridesController } from './price-overrides.controller';
import { PriceOverride } from 'src/entities/price_overides.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceOverride, SubService, Package, Programme]),
    StaffAuthModule,
  ],
  controllers: [PriceOverridesController],
  providers: [PriceOverridesService],
  exports: [PriceOverridesService],
})
export class PriceOverridesModule {}
