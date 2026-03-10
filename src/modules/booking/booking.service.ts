import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from '../../entities/bookings.entity';
import { BookingItem } from '../../entities/booking_items.entity';
import { Promotion } from '../../entities/promotions.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CreateBookingItemDto,
  UpdateBookingItemDto,
} from './booking.dto';
import {
  paginate,
  getPaginationQueryTypeORM,
} from '../../shared/pagination.util';
import {
  PaginationParams,
  PaginatedResponse,
} from '../../shared/pagination.types';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingItem)
    private readonly bookingItemRepository: Repository<BookingItem>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create(data);
    const savedBooking = await this.bookingRepository.save(booking);

    // Increment promotion usage counter if a promotion is applied
    if (data.promotion) {
      const promotionId =
        typeof data.promotion === 'string' ? data.promotion : data.promotion.id;
      await this.promotionRepository.increment({ id: promotionId }, 'used', 1);
    }

    return savedBooking;
  }

  async findAll(
    branchId: string,
    params: PaginationParams = {},
    date?: string,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<Booking>> {
    const where: any = { branch: { id: branchId } };

    // filter by date if provided
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.bookingTime = Between(start, end);
    } else {
      // default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      where.bookingTime = Between(today, end);
    }

    // Apply status filter if provided
    if (status && status !== 'all') {
      where.status = status;
    }

    const { skip, take } = getPaginationQueryTypeORM(params);
    const [data, total] = await this.bookingRepository.findAndCount({
      where,
      relations: [
        'customer',
        'branch',
        'promotion',
        'items',
        'items.subService',
        'items.subService.service',
        'items.package',
        'items.package.subServices',
        'items.package.subServices.service',
        'items.programme',
        'items.programme.steps',
        'items.bed',
        'items.bed.room',
        'items.guests',
      ],
      skip,
      take,
      order: { bookingTime: 'DESC' },
    });

    return paginate(params, total, data);
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'branch',
        'promotion',
        'items',
        'items.subService',
        'items.subService.service',
        'items.package',
        'items.package.subServices',
        'items.package.subServices.service',
        'items.programme',
        'items.programme.steps',
        'items.bed',
        'items.bed.room',
        'items.guests',
      ],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    await this.bookingRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bookingRepository.softDelete(id);
  }

  async createBookingItem(
    bookingId: string,
    itemData: CreateBookingItemDto,
  ): Promise<BookingItem> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const bookingItem = this.bookingItemRepository.create({
      booking,
      itemType: itemData.itemType,
      quantity: itemData.quantity ?? 1,
      price: itemData.price,
      subtotal: itemData.subtotal,
      scheduledDate: itemData.scheduledDate,
      scheduledTime: itemData.scheduledTime,
      notes: itemData.notes,
      duration: itemData.duration ?? 0,
      subService: itemData.subService,
      package: itemData.package,
      programme: itemData.programme,
      bed: itemData.bed,
      guests: itemData.guests,
    });
    return this.bookingItemRepository.save(bookingItem);
  }

  async updateBookingItem(
    itemId: string,
    itemData: UpdateBookingItemDto,
  ): Promise<BookingItem> {
    const updateData: any = {};

    if (itemData.itemType !== undefined)
      updateData.itemType = itemData.itemType;
    if (itemData.quantity !== undefined)
      updateData.quantity = itemData.quantity;
    if (itemData.price !== undefined) updateData.price = itemData.price;
    if (itemData.subtotal !== undefined)
      updateData.subtotal = itemData.subtotal;
    if (itemData.scheduledDate !== undefined)
      updateData.scheduledDate = itemData.scheduledDate;
    if (itemData.scheduledTime !== undefined)
      updateData.scheduledTime = itemData.scheduledTime;
    if (itemData.notes !== undefined) updateData.notes = itemData.notes;
    if (itemData.duration !== undefined)
      updateData.duration = itemData.duration;
    if (itemData.subService !== undefined)
      updateData.subService = itemData.subService;
    if (itemData.package !== undefined) updateData.package = itemData.package;
    if (itemData.programme !== undefined)
      updateData.programme = itemData.programme;
    if (itemData.bed !== undefined) updateData.bed = itemData.bed;
    if (itemData.guests !== undefined) updateData.guests = itemData.guests;

    await this.bookingItemRepository.update(itemId, updateData);
    return this.bookingItemRepository.findOne({ where: { id: itemId } });
  }

  async deleteBookingItem(itemId: string): Promise<void> {
    await this.bookingItemRepository.delete(itemId);
  }
}
