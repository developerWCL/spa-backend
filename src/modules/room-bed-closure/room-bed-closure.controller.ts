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
import { RoomBedClosureService } from './room-bed-closure.service';
import {
  CreateRoomBedClosureDto,
  UpdateRoomBedClosureDto,
} from './room-bed-closure.types';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/decorator/current-user.decorator';

@Controller('room-bed-closures')
@UseGuards(StaffJwtAuthGuard)
@ApiBearerAuth()
@ApiTags('🚪 Room/Bed Closures')
export class RoomBedClosureController {
  constructor(private readonly closureService: RoomBedClosureService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a room or bed closure',
    description: 'Create a closure for a specific date for a room or bed',
  })
  create(
    @Body() dto: CreateRoomBedClosureDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.closureService.create(
      dto,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all room/bed closures',
    description:
      'Get all closures with optional filtering by room, bed, or date range',
  })
  @ApiQuery({
    name: 'roomId',
    required: false,
    type: 'string',
    description: 'Filter by room ID',
  })
  @ApiQuery({
    name: 'bedId',
    required: false,
    type: 'string',
    description: 'Filter by bed ID',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: 'string',
    description: 'Filter from date (ISO format)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: 'string',
    description: 'Filter to date (ISO format)',
  })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('roomId') roomId?: string,
    @Query('bedId') bedId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('search') search?: string,
  ) {
    return this.closureService.findAll(
      branchId,
      roomId,
      bedId,
      fromDate,
      toDate,
      search,
    );
  }

  @Get('by-room/:roomId')
  @ApiOperation({
    summary: 'Get closures by room',
    description: 'Get all closures for a specific room',
  })
  findByRoom(@Param('roomId') roomId: string) {
    return this.closureService.findByRoom(roomId);
  }

  @Get('by-bed/:bedId')
  @ApiOperation({
    summary: 'Get closures by bed',
    description: 'Get all closures for a specific bed',
  })
  findByBed(@Param('bedId') bedId: string) {
    return this.closureService.findByBed(bedId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get closure by ID',
    description: 'Get details of a specific room/bed closure',
  })
  findOne(@Param('id') id: string) {
    return this.closureService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a room/bed closure',
    description: 'Update details of a specific room/bed closure',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomBedClosureDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.closureService.update(
      id,
      dto,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a room/bed closure',
    description: 'Delete a specific room/bed closure',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.closureService.remove(id, currentUser?.sub, currentUser?.email);
  }
}
