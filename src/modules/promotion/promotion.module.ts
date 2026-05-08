import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { Media } from '../../entities/media.entity';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { SubscriptionClientModule } from '../../shared/subscription-client.module';
import { LoggingModule } from 'src/core/logging/logging.module';
import { PromotionService as PromotionServiceEntity } from '../../entities/promotion_services.entity';
import { PromotionPackage } from '../../entities/promotion_packages.entity';
import { PromotionProgramme } from '../../entities/promotion_programmes.entity';
import { Service } from '../../entities/services.entity';
import { Package } from '../../entities/packages.entity';
import { Programme } from '../../entities/programmes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Promotion,
      Branch,
      Media,
      PromotionServiceEntity,
      PromotionPackage,
      PromotionProgramme,
      Service,
      Package,
      Programme,
    ]),
    SubscriptionClientModule,
    LoggingModule,
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
