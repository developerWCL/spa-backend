import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ============================================================
 * LOG S3 UPLOADER SERVICE
 * ============================================================
 *
 * This service handles:
 * 1. Local log cleanup (30-day retention by default) - ACTIVE
 * 2. S3 upload for long-term archival - MOCKUP (not active)
 *
 * To activate:
 * 1. Uncomment the @Cron decorator and implementation
 * 2. Add ScheduleModule.forRoot() to LoggingModule imports
 * 3. Configure environment variables:
 *    - LOG_S3_UPLOAD_ENABLED=true
 *    - LOG_S3_BUCKET=your-bucket-name
 *    - LOG_S3_PREFIX=logs/api
 *    - LOG_DELETE_AFTER_UPLOAD=true (optional)
 *    - LOG_RETENTION_DAYS=30
 *
 * S3 Structure:
 * s3://bucket/
 * └── logs/
 *     └── api/
 *         └── 2026/
 *             └── 01/
 *                 ├── app-2026-01-04.log.gz
 *                 └── error-2026-01-04.log.gz
 */
@Injectable()
export class LogS3UploaderService {
  private readonly logger = new Logger(LogS3UploaderService.name);

  // private readonly s3 = new S3({
  //   region: process.env.AWS_REGION || 'ap-southeast-7',
  // });

  constructor() {
    this.logger.log('LogS3UploaderService initialized (mockup mode)');
  }

  /**
   * Upload yesterday's logs to S3.
   * Runs daily at 2 AM.
   */
  // @Cron('0 2 * * *')
  async uploadYesterdaysLogs(): Promise<void> {
    this.logger.log('[MOCKUP] uploadYesterdaysLogs triggered');

    // if (process.env.LOG_S3_UPLOAD_ENABLED !== 'true') {
    //   this.logger.debug('S3 upload disabled');
    //   return;
    // }

    // const logDir = process.env.LOG_DIR || 'logs';
    // const bucket = process.env.LOG_S3_BUCKET;
    // const prefix = process.env.LOG_S3_PREFIX || 'logs/api';
    // const deleteAfterUpload = process.env.LOG_DELETE_AFTER_UPLOAD === 'true';

    // if (!bucket) {
    //   this.logger.error('LOG_S3_BUCKET not configured');
    //   return;
    // }

    // // Get yesterday's date
    // const yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);
    // const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    // const year = yesterday.getFullYear();
    // const month = String(yesterday.getMonth() + 1).padStart(2, '0');

    // // Find log files from yesterday
    // const patterns = [`app-${dateStr}.log`, `error-${dateStr}.log`];

    // for (const filename of patterns) {
    //   const filepath = path.join(logDir, filename);

    //   if (!fs.existsSync(filepath)) {
    //     this.logger.debug(`File not found: ${filepath}`);
    //     continue;
    //   }

    //   try {
    //     // Compress the file
    //     const fileContent = fs.readFileSync(filepath);
    //     const gzip = promisify(zlib.gzip);
    //     const compressed = await gzip(fileContent);

    //     // Upload to S3
    //     const s3Key = `${prefix}/${year}/${month}/${filename}.gz`;
    //     await this.s3.putObject({
    //       Bucket: bucket,
    //       Key: s3Key,
    //       Body: compressed,
    //       ContentType: 'application/gzip',
    //       ContentEncoding: 'gzip',
    //     });

    //     this.logger.log(`Uploaded: s3://${bucket}/${s3Key}`);

    //     // Delete local file if configured
    //     if (deleteAfterUpload) {
    //       fs.unlinkSync(filepath);
    //       this.logger.debug(`Deleted local file: ${filepath}`);
    //     }
    //   } catch (error) {
    //     this.logger.error(`Failed to upload ${filename}`, error);
    //   }
    // }
  }

  /**
   * Clean up old local log files based on retention policy.
   * Runs daily at 3 AM.
   * Default retention: 30 days (configurable via LOG_RETENTION_DAYS env var)
   */
  @Cron('0 3 * * *')
  async cleanupOldLogs(): Promise<void> {
    const logDir = process.env.LOG_DIR || 'logs';
    const retentionDays = parseInt(process.env.LOG_RETENTION_DAYS || '30', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.logger.log(
      `[cleanupOldLogs] Running cleanup with ${retentionDays}-day retention`,
    );

    if (!fs.existsSync(logDir)) {
      this.logger.debug(`[cleanupOldLogs] Log directory not found: ${logDir}`);
      return;
    }

    const files = fs.readdirSync(logDir);
    const logFilePattern = /^(app|error)-(\d{4}-\d{2}-\d{2})\.log$/;
    let deletedCount = 0;

    for (const file of files) {
      const match = file.match(logFilePattern);
      if (!match) continue;

      const fileDate = new Date(match[2]);
      if (fileDate < cutoffDate) {
        try {
          const filepath = path.join(logDir, file);
          fs.unlinkSync(filepath);
          deletedCount++;
          this.logger.log(`[cleanupOldLogs] Deleted old log: ${file}`);
        } catch (error) {
          this.logger.error(`[cleanupOldLogs] Failed to delete ${file}`, error);
        }
      }
    }

    this.logger.log(
      `[cleanupOldLogs] Cleanup complete. Deleted ${deletedCount} files.`,
    );
  }

  /**
   * Manually trigger log upload (for testing/debugging).
   * Can be called via API endpoint.
   */
  async manualUpload(date?: string): Promise<{ message: string }> {
    this.logger.log(
      `[MOCKUP] Manual upload triggered for date: ${date || 'yesterday'}`,
    );
    // await this.uploadYesterdaysLogs();
    return { message: 'Mockup: upload would be triggered here' };
  }

  /**
   * Manually trigger cleanup (for testing/debugging).
   */
  async manualCleanup(): Promise<{ message: string; deletedCount: number }> {
    this.logger.log('[MOCKUP] Manual cleanup triggered');
    // await this.cleanupOldLogs();
    return {
      message: 'Mockup: cleanup would be triggered here',
      deletedCount: 0,
    };
  }
}
