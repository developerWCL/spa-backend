import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Booking } from '../../entities/bookings.entity';
import { BookingItem } from '../../entities/booking_items.entity';
import { Promotion } from '../../entities/promotions.entity';
import { Guest } from '../../entities/guests.entity';
import { EntityGuestGender } from '../../entities/enums/entity-guest.enum';
import { GuestsService } from '../guests/guests.service';
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
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    private readonly guestsService: GuestsService,
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
    search?: string,
    status?: string,
    lifeCycle?: 'all' | 'today' | 'upcoming' | 'past',
  ): Promise<PaginatedResponse<Booking>> {
    const { skip, take } = getPaginationQueryTypeORM(params);

    let query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.branch', 'branch')
      .leftJoinAndSelect('booking.promotion', 'promotion')
      .leftJoinAndSelect('booking.items', 'items')
      .leftJoinAndSelect('items.subService', 'subService')
      .leftJoinAndSelect('subService.service', 'service')
      .leftJoinAndSelect('items.package', 'package')
      .leftJoinAndSelect('package.subServices', 'packageSubServices')
      .leftJoinAndSelect('packageSubServices.service', 'packageService')
      .leftJoinAndSelect('items.programme', 'programme')
      .leftJoinAndSelect('programme.steps', 'steps')
      .leftJoinAndSelect('items.bed', 'bed')
      .leftJoinAndSelect('bed.room', 'room')
      .leftJoinAndSelect('items.guests', 'guests')
      .where('booking.branchId = :branchId', { branchId });

    if (status && status !== 'all') {
      query = query.andWhere('booking.status = :status', { status });
    }

    if (search) {
      query = query.andWhere(
        '(LOWER(customer.firstName) LIKE LOWER(:search) OR LOWER(customer.lastName) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (lifeCycle && lifeCycle !== 'all') {
      if (lifeCycle === 'today') {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        const end = new Date(day);
        end.setHours(23, 59, 59, 999);
        query = query.andWhere(
          'items.scheduledDate BETWEEN :startDate AND :endDate',
          {
            startDate: day,
            endDate: end,
          },
        );
      } else if (lifeCycle === 'upcoming') {
        const now = new Date();
        query = query.andWhere('items.scheduledDate >= :now', { now });
      } else if (lifeCycle === 'past') {
        const now = new Date();
        query = query.andWhere('items.scheduledDate <= :now', { now });
      }
    }

    query = query.orderBy('booking.bookingTime', 'DESC').skip(skip).take(take);

    const [data, total] = await query.getManyAndCount();

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

    // Handle guest creation/linking
    const linkedGuests: Guest[] = [];

    if (itemData.guestData && itemData.guestData.length > 0) {
      // Create or find guests from guestData
      for (const guestDataItem of itemData.guestData) {
        if (guestDataItem?.id) {
          // Guest already exists, just link it
          const existingGuest = await this.guestRepository.findOne({
            where: { id: guestDataItem.id },
          });
          if (existingGuest) {
            linkedGuests.push(existingGuest);
          }
        } else if (
          guestDataItem?.email &&
          guestDataItem?.firstName &&
          guestDataItem?.lastName
        ) {
          // Try to find or create guest by email
          let guest = await this.guestRepository.findOne({
            where: { email: guestDataItem.email },
          });

          if (!guest) {
            // Determine gender enum value
            let genderValue = EntityGuestGender.MALE;
            if (guestDataItem.gender) {
              const genderStr = String(guestDataItem.gender).toUpperCase();
              if (genderStr === 'female' || genderStr === 'male') {
                genderValue = genderStr as EntityGuestGender;
              }
            }

            // Create new guest
            guest = await this.guestsService.create({
              firstName: guestDataItem.firstName || '',
              lastName: guestDataItem.lastName || '',
              email: guestDataItem.email || '',
              phone: guestDataItem.phone || undefined,
              nationality: guestDataItem.nationality || undefined,
              gender: genderValue,
              specialRequest: guestDataItem.specialRequest || undefined,
              spaId: itemData.spaId,
            });
          }
          linkedGuests.push(guest);
        }
      }
    } else if (itemData.guests && itemData.guests.length > 0) {
      // Handle guests as array of IDs or objects
      for (const guestRef of itemData.guests) {
        let guestId = '';

        if (typeof guestRef === 'string') {
          guestId = guestRef;
        } else if (
          guestRef &&
          typeof guestRef === 'object' &&
          'id' in guestRef
        ) {
          guestId = guestRef.id;
        } else {
          continue;
        }

        const guest = await this.guestRepository.findOne({
          where: { id: guestId },
        });
        if (guest) {
          linkedGuests.push(guest);
        }
      }
    }

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
      guests: linkedGuests.length > 0 ? linkedGuests : undefined,
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
