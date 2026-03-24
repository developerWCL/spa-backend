import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { Package } from 'src/entities/packages.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { SubServiceTranslation } from 'src/entities/sub_service_translations.entity';
import { Service } from 'src/entities/services.entity';
import { PackageTranslation } from 'src/entities/package_translation.entity';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Package,
      SubService,
      SubServiceTranslation,
      Service,
      PackageTranslation,
      Branch,
      Media,
    ]),
    StaffAuthModule,
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
