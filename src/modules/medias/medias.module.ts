import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { S3Module } from '../3rd-party/s3/s3.module';
import { Media } from 'src/entities/media.entity';
import { Service } from 'src/entities/services.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [
    S3Module,
    StaffAuthModule,
    TypeOrmModule.forFeature([Media, Service]),
  ],
  controllers: [MediasController],
  providers: [MediasService],
})
export class MediasModule {}
