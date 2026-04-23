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
  Logger,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CreateBookingItemDto,
  UpdateBookingItemDto,
} from './booking.dto';
import { StaffJwtAuthGuard } from 'src/guards/staff-jwt.guard';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';
import {
  CurrentUser,
  CurrentUserPayload,
} from 'src/decorator/current-user.decorator';

@Controller('bookings')
@ApiBearerAuth()
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  create(
    @Body() data: CreateBookingDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    console.log('currentUser', currentUser);

    return this.bookingService.create(
      data,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @UseGuards(
    StaffJwtAuthGuard,
    //ApiKeyGuard
  )
  @Get()
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  findAll(
    @Query('branchId') branchId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('startDateTime') startDateTime?: Date,
    @Query('endDateTime') endDateTime?: Date,
    @Query('hasBedOrRoom') hasBedOrRoom?: string,
  ) {
    const hasBedOrRoomBool = hasBedOrRoom === 'true' ? true : undefined;
    return this.bookingService.findAll(
      branchId,
      { page, limit },
      search,
      status,
      startDateTime,
      endDateTime,
      hasBedOrRoomBool,
    );
  }

  @Get(':id')
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  update(
    @Param('id') id: string,
    @Body() data: UpdateBookingDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.bookingService.update(
      id,
      data,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @Delete(':id')
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.bookingService.remove(id, currentUser?.sub, currentUser?.email);
  }

  @Post(':bookingId/send-confirmation')
  @ApiOperation({ summary: 'Send booking confirmation email to guest' })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  async sendConfirmationEmail(@Param('bookingId') bookingId: string) {
    this.logger.log(`[send-confirmation] Called for bookingId=${bookingId}`);
    try {
      await this.bookingService.sendConfirmationEmail(bookingId);
      this.logger.log(
        `[send-confirmation] Email sent for bookingId=${bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `[send-confirmation] Failed for bookingId=${bookingId}`,
        error,
      );
      throw error;
    }
    return { success: true };
  }

  // Booking items endpoints
  @Post(':bookingId/items')
  @ApiOperation({ summary: 'Add an item to a booking' })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  createBookingItem(
    @Param('bookingId') bookingId: string,
    @Body() itemData: CreateBookingItemDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.bookingService.createBookingItem(
      bookingId,
      itemData,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update a booking item' })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  updateBookingItem(
    @Param('itemId') itemId: string,
    @Body() itemData: UpdateBookingItemDto,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.bookingService.updateBookingItem(
      itemId,
      itemData,
      currentUser?.sub,
      currentUser?.email,
    );
  }

  @UseGuards(StaffJwtAuthGuard, ApiKeyGuard)
  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Delete a booking item' })
  @ApiHeader({ name: 'spa-id', description: 'The ID of the spa' })
  deleteBookingItem(
    @Param('itemId') itemId: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.bookingService.deleteBookingItem(
      itemId,
      currentUser?.sub,
      currentUser?.email,
    );
  }
}
