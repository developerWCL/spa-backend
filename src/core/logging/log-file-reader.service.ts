import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { QueryLogsDto, IngestLogDto } from './dto';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  context: string;
  message: string;
  meta?: Record<string, any>;
  spaId?: string;
  source?: string;
}

@Injectable()
export class LogFileReaderService {
  private readonly logger = new Logger(LogFileReaderService.name);
  private readonly logDir = process.env.LOG_DIR || 'logs';

  constructor() {}

  /**
   * Query logs from files - matches the old DB-based API response format
   */
  async queryLogs(query: QueryLogsDto): Promise<{
    logs: LogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      level,
      context,
      spaId,
      source,
      search,
      from,
      to,
      page = 1,
      limit = 50,
    } = query;

    // Determine which date(s) to search
    const dates = this.getDateRange(from, to);
    let allLogs: LogEntry[] = [];

    this.logger.log(
      `[queryLogs] Searching dates: ${dates.join(', ')}, logDir: ${this.logDir}`,
    );

    for (const date of dates) {
      const filename =
        level === 'error' ? `error-${date}.log` : `app-${date}.log`;
      const filepath = path.join(this.logDir, filename);

      this.logger.log(
        `[queryLogs] Checking file: ${filepath}, exists: ${fs.existsSync(filepath)}`,
      );

      if (fs.existsSync(filepath)) {
        const logs = await this.readLogFile(filepath, date);
        this.logger.log(
          `[queryLogs] Read ${logs.length} logs from ${filename}`,
        );
        allLogs.push(...logs);
      }
    }

    // Apply filters
    if (level) {
      allLogs = allLogs.filter((log) => log.level === level);
    }
    if (context) {
      allLogs = allLogs.filter((log) =>
        log.context.toLowerCase().includes(context.toLowerCase()),
      );
    }
    if (spaId) {
      allLogs = allLogs.filter((log) => log.spaId === spaId);
    }
    if (source) {
      allLogs = allLogs.filter((log) => log.source === source);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      allLogs = allLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.meta || {})
            .toLowerCase()
            .includes(searchLower),
      );
    }

    // Sort by timestamp descending (most recent first)
    allLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const total = allLogs.length;
    const offset = (page - 1) * limit;
    const paginatedLogs = allLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get log statistics
   */
  async getLogStats(spaId?: string): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
    last24Hours: number;
  }> {
    const today = this.getTodayDate();
    const logs = await this.queryLogs({ limit: 10000, page: 1, spaId });

    const byLevel: Record<string, number> = {};
    const byContext: Record<string, number> = {};
    let last24Hours = 0;
    const cutoff24h = Date.now() - 24 * 60 * 60 * 1000;

    for (const log of logs.logs) {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      byContext[log.context] = (byContext[log.context] || 0) + 1;
      if (new Date(log.timestamp).getTime() > cutoff24h) {
        last24Hours++;
      }
    }

    return {
      total: logs.total,
      byLevel,
      byContext,
      last24Hours,
    };
  }

  /**
   * Get list of unique contexts
   */
  async getContexts(): Promise<string[]> {
    const logs = await this.queryLogs({ limit: 5000, page: 1 });
    const contexts = new Set<string>();
    for (const log of logs.logs) {
      contexts.add(log.context);
    }
    return Array.from(contexts).sort();
  }

  /**
   * Ingest logs from web client
   */
  async ingestLog(dto: IngestLogDto): Promise<{ success: boolean }> {
    const { level, context, message, meta, spaId } = dto;

    // Write using NestJS Logger (which will go to console and files via Winston)
    const logMessage = `[${context}] ${message}`;
    const logMeta = { ...meta, spaId, source: 'web' };

    switch (level) {
      case 'error':
        this.logger.error(logMessage, JSON.stringify(logMeta));
        break;
      case 'warn':
        this.logger.warn(logMessage, JSON.stringify(logMeta));
        break;
      case 'debug':
        this.logger.debug(logMessage, JSON.stringify(logMeta));
        break;
      default:
        this.logger.log(logMessage, JSON.stringify(logMeta));
    }

    return { success: true };
  }

  private async readLogFile(
    filepath: string,
    date: string,
  ): Promise<LogEntry[]> {
    return new Promise((resolve, reject) => {
      const logs: LogEntry[] = [];
      let lineNum = 0;

      const fileStream = fs.createReadStream(filepath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        lineNum++;
        try {
          const parsed = JSON.parse(line);
          logs.push({
            id: `${date}-${lineNum}`,
            timestamp: parsed.timestamp,
            level: parsed.level,
            context: parsed.context || 'Unknown',
            message: parsed.message,
            meta: this.extractMeta(parsed),
            spaId: parsed.spaId,
            source: parsed.source || 'api',
          });
        } catch {
          // Skip malformed lines
        }
      });

      rl.on('close', () => resolve(logs));
      rl.on('error', reject);
    });
  }

  private extractMeta(parsed: any): Record<string, any> | undefined {
    const { timestamp, level, context, message, spaId, source, ...meta } =
      parsed;
    return Object.keys(meta).length > 0 ? meta : undefined;
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDateRange(from?: string, to?: string): string[] {
    if (!from && !to) {
      return [this.getTodayDate()];
    }

    const dates: string[] = [];
    const startDate = from ? new Date(from) : new Date();
    const endDate = to ? new Date(to) : new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  }
}
