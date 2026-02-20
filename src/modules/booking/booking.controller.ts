import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto } from './booking.dto';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';

@Controller('bookings')
@UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  create(@Body() data: CreateBookingDto) {
    return this.bookingService.create(data);
  }

  @Get()
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  findAll(
    @Query('branchId') branchId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('date') date?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingService.findAll(
      branchId,
      { page, limit },
      date,
      search,
      status,
    );
  }

  @Get(':id')
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  update(@Param('id') id: string, @Body() data: UpdateBookingDto) {
    return this.bookingService.update(id, data);
  }

  @Delete(':id')
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
