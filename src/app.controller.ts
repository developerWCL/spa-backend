import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('country')
  getCountry(): { code: string; title: string }[] {
    return this.appService.getCountry();
  }

  @Get('health')
  async getHealth(@Res({ passthrough: true }) res: Response) {
    let db: 'ok' | 'error' = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      db = 'error';
    }
    res.status(db === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return {
      status: db === 'ok' ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      db,
    };
  }
}
