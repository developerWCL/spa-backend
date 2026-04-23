import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ActionLog } from '../../entities/action_log.entity';

/**
 * Service for managing action log retention and cleanup.
 * Automatically removes old action logs after 2 months via scheduled cron job.
 */
@Injectable()
export class ActionLogCleanupService {
  private readonly logger = new Logger(ActionLogCleanupService.name);

  constructor(
    @InjectRepository(ActionLog)
    private readonly actionLogRepository: Repository<ActionLog>,
  ) {}

  /**
   * Cron job to remove action logs older than 2 months.
   * Runs daily at 2:00 AM Bangkok time.
   *
   * The cron expression '0 2 * * *' means:
   * - 0: at minute 0
   * - 2: at hour 2 (2:00 AM Bangkok time)
   * - *: every day of month
   * - *: every month
   * - *: every day of week
   */
  @Cron('0 2 * * *', { timeZone: 'Asia/Bangkok' })
  async cleanupOldActionLogs(): Promise<void> {
    try {
      this.logger.log('Starting action log cleanup job...');

      // Calculate date 2 months ago
      const twoMonthsAgo = this.getDateTwoMonthsAgo();

      this.logger.log(
        `Removing action logs older than ${twoMonthsAgo.toISOString()}`,
      );

      // Delete action logs older than 2 months
      const result = await this.actionLogRepository.delete({
        actionDate: LessThan(twoMonthsAgo),
      });

      this.logger.log(
        `Action log cleanup completed. Deleted ${result.affected} records.`,
      );
    } catch (error) {
      this.logger.error(
        `Action log cleanup failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Calculate date from 2 months ago.
   * Uses the current date and subtracts 2 months.
   *
   * @returns Date object representing 2 months ago
   */
  private getDateTwoMonthsAgo(): Date {
    const now = new Date();
    // Subtract 2 months (60 days approximate)
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return twoMonthsAgo;
  }

  /**
   * Get count of action logs that will be deleted.
   * Useful for monitoring and alerting.
   *
   * @returns Count of logs older than 2 months
   */
  async getLogsToBeDeletedCount(): Promise<number> {
    const twoMonthsAgo = this.getDateTwoMonthsAgo();
    return await this.actionLogRepository.count({
      where: {
        actionDate: LessThan(twoMonthsAgo),
      },
    });
  }

  /**
   * Manually trigger cleanup (for testing or manual maintenance).
   * In production, use the automatic cron job instead.
   *
   * @returns Number of deleted records
   */
  async triggerCleanupManually(): Promise<number> {
    try {
      const twoMonthsAgo = this.getDateTwoMonthsAgo();
      const result = await this.actionLogRepository.delete({
        actionDate: LessThan(twoMonthsAgo),
      });
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Manual cleanup failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
