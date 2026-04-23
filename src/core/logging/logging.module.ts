import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppLoggerService } from './app-logger.service';
import { LogS3UploaderService } from './log-s3-uploader.service';
import { LogFileReaderService } from './log-file-reader.service';
import { ActionLogService } from './action-log.service';
import { LogsController } from './logs.controller';
import { ActionLog } from '../../entities/action_log.entity';

/**
 * LoggingModule provides global logging services.
 * Services are available throughout the application.
 * Includes file-based logging (AppLoggerService) and database audit logging (ActionLogService).
 * Controller is also included here for admin/logs API.
 */
@Global()
@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([ActionLog])],
  controllers: [LogsController],
  providers: [
    AppLoggerService,
    LogS3UploaderService,
    LogFileReaderService,
    ActionLogService,
  ],
  exports: [
    AppLoggerService,
    LogS3UploaderService,
    LogFileReaderService,
    ActionLogService,
  ],
})
export class LoggingModule {}
