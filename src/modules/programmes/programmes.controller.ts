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
  Patch,
} from '@nestjs/common';
import { ProgrammesService } from './programmes.service';
import { CreateProgrammeDto, UpdateProgrammeDto } from './programmes.types';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiQuery,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { PaginationParams } from 'src/shared/pagination.types';

@Controller('programmes')
@ApiTags('Programmes')
@UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
@ApiBearerAuth()
export class ProgrammesController {
  constructor(private readonly programmesService: ProgrammesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new programme with steps and translations',
    description:
      'Create a programme including programme steps and translations in multiple languages',
  })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa/branch ID',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Programme created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  create(@Body() dto: CreateProgrammeDto) {
    return this.programmesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all programmes for a branch',
    description: 'Get paginated list of programmes with filtering options',
  })
  @ApiHeader({
    name: 'spa-id',
    description: 'The spa/branch ID',
    required: false,
  })
  @ApiQuery({
    name: 'branchId',
    required: true,
    type: 'string',
    description: 'Branch ID',
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
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by programme name or description',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    enum: ['active', 'inactive'],
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of programmes',
  })
  findAll(
    @Query('branchId') branchId: string,
    @Query() params: PaginationParams,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    params.page = params.page || 1;
    params.limit = params.limit || 10;
    return this.programmesService.findAll(branchId, params, search, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a programme by ID',
    description:
      'Get detailed information about a specific programme including all steps and translations',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme details',
  })
  @ApiResponse({
    status: 404,
    description: 'Programme not found',
  })
  findById(@Param('id') id: string) {
    return this.programmesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a programme',
    description:
      'Update programme details, steps, and translations. Provide complete data as it will replace existing records.',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Programme not found',
  })
  update(@Param('id') id: string, @Body() dto: UpdateProgrammeDto) {
    return this.programmesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a programme (soft delete)',
    description: 'Soft delete a programme. Can be restored later.',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Programme not found',
  })
  remove(@Param('id') id: string) {
    return this.programmesService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restore a deleted programme',
    description: 'Restore a soft-deleted programme',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Programme not found',
  })
  restore(@Param('id') id: string) {
    return this.programmesService.restore(id);
  }
}
