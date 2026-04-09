import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppLoggerService } from './app-logger.service';
import { LogS3UploaderService } from './log-s3-uploader.service';
import { LogFileReaderService } from './log-file-reader.service';
import { LogsController } from './logs.controller';

/**
 * LoggingModule provides global logging services.
 * Services are available throughout the application.
 * Controller is also included here for admin/logs API.
 */
@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [LogsController],
  providers: [AppLoggerService, LogS3UploaderService, LogFileReaderService],
  exports: [AppLoggerService, LogS3UploaderService, LogFileReaderService],
})
export class LoggingModule {}
