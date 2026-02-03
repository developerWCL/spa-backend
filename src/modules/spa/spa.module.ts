import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaService } from './spa.service';
import { SpaController } from './spa.controller';
import { Spa } from 'src/entities/spa.entity';
import { SpaApiKey } from 'src/entities/spa_api_keys.entity';
import { SubscriptionClientService } from 'src/shared/subscription-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Spa, SpaApiKey])],
  providers: [SpaService, SubscriptionClientService],
  controllers: [SpaController],
  exports: [SpaService],
})
export class SpaModule {}
