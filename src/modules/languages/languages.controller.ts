import { Controller, Get, Param, Query } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { ApiOperation, ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';

@Controller('languages')
@ApiTags('Languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all available languages',
    description: 'Retrieve list of all languages or only active languages',
  })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: 'boolean',
    description: 'Filter to show only active languages (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of languages',
  })
  findAll(@Query('onlyActive') onlyActive: string = 'true') {
    return this.languagesService.findAll(onlyActive === 'true');
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get all active languages',
    description: 'Retrieve list of languages that are currently active',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active languages',
  })
  getActiveLanguages() {
    return this.languagesService.getActiveLanguages();
  }

  @Get('primary')
  @ApiOperation({
    summary: 'Get primary language',
    description: 'Retrieve the primary language of the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Primary language',
  })
  @ApiResponse({
    status: 404,
    description: 'No primary language found',
  })
  getPrimaryLanguage() {
    return this.languagesService.getPrimaryLanguage();
  }

  @Get('code/:code')
  @ApiOperation({
    summary: 'Get language by code',
    description: 'Retrieve a language by its code (e.g., en, th)',
  })
  @ApiResponse({
    status: 200,
    description: 'Language details',
  })
  @ApiResponse({
    status: 404,
    description: 'Language not found',
  })
  findByCode(@Param('code') code: string) {
    return this.languagesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get language by ID',
    description: 'Retrieve a language by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Language details',
  })
  @ApiResponse({
    status: 404,
    description: 'Language not found',
  })
  findById(@Param('id') id: string) {
    return this.languagesService.findById(id);
  }
}
