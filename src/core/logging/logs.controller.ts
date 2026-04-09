import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { LogFileReaderService } from './log-file-reader.service';
import { QueryLogsDto, IngestLogDto } from './dto';

@ApiTags('Logs')
@Controller('admin/logs')
export class LogsController {
  constructor(private readonly logFileReader: LogFileReaderService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Query system logs (ADMIN or SUPER_ADMIN only)',
  })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - ADMIN or SUPER_ADMIN role required',
  })
  async queryLogs(@Query() query: QueryLogsDto) {
    return this.logFileReader.queryLogs(query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get log statistics' })
  @ApiResponse({ status: 200, description: 'Log stats retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - ADMIN or SUPER_ADMIN role required',
  })
  async getStats(@Query('spaId') spaId?: string) {
    return this.logFileReader.getLogStats(spaId);
  }

  @Get('contexts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of log contexts' })
  @ApiResponse({ status: 200, description: 'Contexts retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - ADMIN or SUPER_ADMIN role required',
  })
  async getContexts() {
    return this.logFileReader.getContexts();
  }

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest logs from web client' })
  @ApiResponse({ status: 201, description: 'Log ingested successfully' })
  async ingestLog(@Body() dto: IngestLogDto) {
    return this.logFileReader.ingestLog(dto);
  }
}
