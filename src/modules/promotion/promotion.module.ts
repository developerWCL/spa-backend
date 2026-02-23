import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { SubscriptionClientModule } from '../../shared/subscription-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, Branch]),
    SubscriptionClientModule,
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
