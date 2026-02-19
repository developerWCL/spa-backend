import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BedsService } from './beds.service';
import { CreateBedDto, UpdateBedDto } from './beds.types';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/decorator/current-user.decorator';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@Controller('beds')
@UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
@ApiBearerAuth()
export class BedsController {
  constructor(private readonly bedsService: BedsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bed' })
  create(@Body() dto: CreateBedDto) {
    return this.bedsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all beds by branch with pagination' })
  findAll(
    @Query('branchId') branchId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.bedsService.findAll(
      branchId,
      currentUser?.branchIds || [],
      pageNum,
      limitNum,
      search,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bed by ID' })
  findOne(@Param('id') id: string) {
    return this.bedsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bed by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateBedDto) {
    return this.bedsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bed by ID' })
  remove(@Param('id') id: string) {
    return this.bedsService.remove(id);
  }
}
