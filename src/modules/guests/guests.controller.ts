import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto, UpdateGuestDto } from './guests.types';

import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';

@Controller('guests')
@ApiBearerAuth()
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new guest' })
  create(@Body() dto: CreateGuestDto) {
    return this.guestsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all guests with optional customer filter' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    type: 'string',
    description: 'Filter guests by customer ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by first name, last name or email',
  })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  findAll(
    @Headers('spa-id') spaId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.guestsService.findAll(
      pageNum,
      limitNum,
      customerId,
      search,
      spaId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guest by ID' })
  findOne(@Param('id') id: string) {
    return this.guestsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update guest by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateGuestDto) {
    return this.guestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete guest by ID' })
  remove(@Param('id') id: string) {
    return this.guestsService.remove(id);
  }
}
