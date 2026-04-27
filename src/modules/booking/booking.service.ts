import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Booking } from '../../entities/bookings.entity';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';
import { BookingItem } from '../../entities/booking_items.entity';
import { Promotion } from '../../entities/promotions.entity';
import { Payment } from '../../entities/payments.entity';
import { Guest } from '../../entities/guests.entity';
import { SubService } from '../../entities/sub_services.entity';
import { Package } from '../../entities/packages.entity';
import { Programme } from '../../entities/programmes.entity';
import { Room } from '../../entities/rooms.entity';
import { Staff } from '../../entities/staffs.entity';
import { EntityGuestGender } from '../../entities/enums/entity-guest.enum';
import { GuestsService } from '../guests/guests.service';
import { MailService } from '../../shared/services/mail.service';
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
import { isUUID } from 'class-validator';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingItem)
    private readonly bookingItemRepository: Repository<BookingItem>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    @InjectRepository(SubService)
    private readonly subServiceRepository: Repository<SubService>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Programme)
    private readonly programmeRepository: Repository<Programme>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly guestsService: GuestsService,
    private readonly mailService: MailService,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('BookingService');
  }

  /**
   * Pre-generate a booking reference (e.g. "DPR-00003") without creating the booking.
   * Used by PayPal flow to set invoice_id before the order is captured.
   */
  async generateBookingReference(branchId: string): Promise<string> {
    let branchCode = 'BKG'; // Default fallback

    const branch = await this.bookingRepository.query(
      `SELECT id, name FROM branch WHERE id = $1`,
      [branchId],
    );

    if (branch?.[0]?.name) {
      // Generate code from branch name (e.g., "Siam Branch" -> "SB")
      branchCode =
        branch[0].name
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 3) || 'BKG';
    }

    // Get the next running number for this branch
    const bookingCount = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.branchId = :branchId', { branchId })
      .getCount();

    const runningNumber = String(bookingCount + 1).padStart(5, '0');
    return `${branchCode}-${runningNumber}`;
  }

  async create(
    data: CreateBookingDto,
    actorId?: string,
    actorName?: string,
  ): Promise<Booking> {
    this.logger.log('Creating booking', { branchId: data.branch });
    // Generate a unique booking ID: Branch code + running number
    // If a bookingId was pre-generated (e.g. PayPal flow), use it directly to keep
    // the reference consistent between the PayPal invoice and the booking record.
    let bookingId = (data as any).bookingId as string | undefined;

    if (!bookingId) {
      let branchCode = 'BKG'; // Default fallback

      // If branch is provided, generate code from branch
      if (data.branch) {
        const branch =
          typeof data.branch === 'string'
            ? await this.bookingRepository.query(
                `SELECT id, name FROM branch WHERE id = $1`,
                [data.branch],
              )
            : data.branch;

        if (branch && (branch.name || branch[0]?.name)) {
          const branchName = branch.name || branch[0]?.name;
          // Generate code from branch name (e.g., "Siam Branch" -> "SB")
          branchCode =
            (branchName as string)
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase())
              .join('')
              .substring(0, 3) || 'BKG';
        }
      }

      // Get the next running number for this branch
      const bookingCount = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.branchId = :branchId', {
          branchId:
            typeof data.branch === 'string' ? data.branch : data.branch?.id,
        })
        .getCount();

      const runningNumber = String(bookingCount + 1).padStart(5, '0');
      bookingId = `${branchCode}-${runningNumber}`;
    }

    // Exclude payments array from booking data to prevent duplication
    const { payments, ...bookingDataWithoutPayments } = data;

    const booking = this.bookingRepository.create({
      ...bookingDataWithoutPayments,
      bookingId,
    });
    const savedBooking = await this.bookingRepository.save(booking);

    // Create payment records for the booking
    if (payments && Array.isArray(payments) && payments.length > 0) {
      const paymentRecords = payments.map((payment) =>
        this.paymentRepository.create({
          booking: savedBooking,
          amount: payment.amount,
          status: payment.status,
          paymentType: payment.paymentType,
        }),
      );
      await this.paymentRepository.save(paymentRecords);
    }

    // Increment promotion usage counter if a promotion is applied
    if (data.promotion) {
      const promotionId =
        typeof data.promotion === 'string' ? data.promotion : data.promotion.id;
      await this.promotionRepository.increment({ id: promotionId }, 'used', 1);
    }

    this.logger.log('Booking created successfully', {
      bookingId: savedBooking.id,
    });

    // Log action to database (if user information provided)
    if (actorId) {
      const branchId =
        typeof data.branch === 'string' ? data.branch : data.branch?.id;
      await this.actionLogService.logAction({
        actionType: 'create',
        feature: 'booking',
        subFeature: null,
        actorId,
        actorName: actorName || null,
        branchId: branchId || null,
        newData: {
          id: savedBooking.id,
          bookingId: savedBooking.bookingId,
          status: savedBooking.status,
          bookingTime: savedBooking.bookingTime,
          branchId: savedBooking.branch?.id,
          customerId: savedBooking.customer?.id,
          totalAmount: savedBooking.totalAmount,
        },
        entityType: 'booking',
        entityId: savedBooking.id,
        description: `Created booking: ${savedBooking.bookingId}`,
        status: 'success',
      });
    }

    return savedBooking;
  }

  async findAll(
    branchId: string,
    params: PaginationParams = {},
    search?: string,
    status?: string,
    startDateTime?: Date,
    endDateTime?: Date,
    hasBedOrRoom?: boolean,
  ): Promise<PaginatedResponse<Booking>> {
    const { skip, take } = getPaginationQueryTypeORM(params);

    let query = this.bookingRepository
      .createQueryBuilder('booking')
      // Use leftJoinAndSelect carefully with pagination
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.branch', 'branch')
      .leftJoinAndSelect('booking.promotion', 'promotion')
      .leftJoinAndSelect('booking.items', 'items')
      .leftJoinAndSelect('booking.payments', 'payments')
      .leftJoinAndSelect('items.subService', 'subService')
      .leftJoinAndSelect('subService.service', 'service')
      .leftJoinAndSelect('items.package', 'package')
      .leftJoinAndSelect('package.subServices', 'packageSubServices')
      .leftJoinAndSelect('packageSubServices.service', 'packageService')
      .leftJoinAndSelect('items.programme', 'programme')
      .leftJoinAndSelect('programme.steps', 'steps')
      .leftJoinAndSelect('items.bed', 'bed')
      .leftJoinAndSelect('bed.room', 'room')
      .leftJoinAndSelect('items.staff', 'staff')
      .leftJoinAndSelect('items.room', 'itemRoom')
      .leftJoinAndSelect('items.guests', 'guests')
      .where('booking.branchId = :branchId', { branchId });

    // Filter out failed payments
    query = query.andWhere(
      new Brackets((qb) => {
        qb.where('payments.status IS NULL').orWhere(
          'payments.status != :paidStatus',
          {
            paidStatus: 'failed',
          },
        );
      }),
    );

    if (status && status !== 'all') {
      query = query.andWhere('booking.status = :status', { status });
    }

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      query = query.andWhere(
        new Brackets((qb) => {
          // Use ILIKE for exact or partial ID match
          qb.where('booking.bookingId ILIKE :rawSearch', {
            rawSearch: `%${search}%`,
          })
            .orWhere('LOWER(customer.lastName) LIKE :searchTerm', {
              searchTerm,
            })
            .orWhere('LOWER(customer.firstName) LIKE :searchTerm', {
              searchTerm,
            })
            .orWhere('LOWER(guests.firstName) LIKE :searchTerm', { searchTerm })
            .orWhere('LOWER(guests.lastName) LIKE :searchTerm', { searchTerm });
        }),
      );
    }

    // Date Filtering
    if (startDateTime && endDateTime) {
      query = query.andWhere(
        'items.scheduledDate BETWEEN :startDateTime AND :endDateTime',
        {
          startDateTime,
          endDateTime,
        },
      );
    } else if (startDateTime) {
      query = query.andWhere('items.scheduledDate >= :startDateTime', {
        startDateTime,
      });
    } else if (endDateTime) {
      query = query.andWhere('items.scheduledDate <= :endDateTime', {
        endDateTime,
      });
    }

    // Filter for bookings with bed or room assigned
    if (hasBedOrRoom === true) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where('items.bed IS NOT NULL').orWhere('items.room IS NOT NULL');
        }),
      );
    }

    // CRITICAL FIX FOR PAGINATION WITH JOINS:
    // Use setMaxResults instead of take if you experience weird duplicates,
    // but usually take/skip are correct if getManyAndCount is used.
    const [data, total] = await query
      .orderBy('booking.bookingTime', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
    const totalCount = await query.getCount();

    return paginate(params, totalCount, data);
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
        'items.subService.translations',
        'items.subService.service',
        'items.subService.service.translations',
        'items.package',
        'items.package.translations',
        'items.package.subServices',
        'items.package.subServices.service',
        'items.programme',
        'items.programme.translations',
        'items.programme.steps',
        'items.bed',
        'items.bed.room',
        'items.staff',
        'items.room',
        'items.guests',
        'branch.spa',
      ],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Load payments separately to avoid one-to-many join issues
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.bookingId = :bookingId', { bookingId: id })
      .getMany();
    booking.payments = payments;

    return booking;
  }

  async update(
    id: string,
    data: UpdateBookingDto,
    actorId?: string,
    actorName?: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['customer', 'branch'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Capture old data before update
    const oldData = {
      id: booking.id,
      bookingId: booking.bookingId,
      status: booking.status,
      totalAmount: booking.totalAmount,
      branchId: booking.branch.id,
    };

    // Separate items and payments data from booking data
    const { items, payments, ...bookingData } = data;
    // update payments if provided
    if (payments && Array.isArray(payments)) {
      for (const payment of payments) {
        if (payment.id && isUUID(payment.id)) {
          // Update existing payment
          // Fetch existing payment to check current status
          const existingPayment = await this.paymentRepository.findOne({
            where: { id: payment.id },
          });

          let updateAmount = payment.amount;
          // If payment is being changed from paid to refund, set amount to 0
          if (
            (existingPayment?.status?.toLowerCase() !== 'refunded' &&
              payment.status?.toLowerCase() === 'refunded') ||
            (existingPayment?.status?.toLowerCase() !== 'failed' &&
              payment.status?.toLowerCase() === 'failed')
          ) {
            updateAmount = '0';
          }

          await this.paymentRepository.update(payment.id, {
            amount: updateAmount,
            status: payment.status,
            paymentType: payment.paymentType,
          });
        } else {
          // Create new payment
          const newPayment = this.paymentRepository.create({
            booking: { id },
            amount: payment.amount,
            status: payment.status,
            paymentType: payment.paymentType,
          });
          await this.paymentRepository.save(newPayment);
        }
      }
    }

    // Update booking
    await this.bookingRepository.update(id, bookingData);

    // Handle bookingItems updates if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const itemData of items) {
        if (itemData._destroy && itemData.id) {
          // Delete item
          await this.deleteBookingItem(itemData.id);
          if (itemData.guests && itemData.guests.length > 0) {
            // Unlink guests from the deleted booking item
            const guestIds = itemData.guests.map((guest) =>
              typeof guest === 'string' ? guest : guest.id,
            );
            await this.bookingItemRepository
              .createQueryBuilder()
              .relation(BookingItem, 'guests')
              .of(itemData.id)
              .remove(guestIds);
          }
        } else if (itemData.id) {
          // Update existing item
          const { id: itemId, ...updateItemData } = itemData;
          await this.updateBookingItem(
            itemId,
            updateItemData,
            actorId,
            actorName,
          );
        } else {
          // Create new item
          await this.createBookingItem(id, itemData, actorId, actorName);
        }
      }
    }

    // Get the updated booking with all details
    const updatedBooking = await this.findOne(id);

    // Send status update email if status changed to confirmed or cancelled
    if (
      bookingData.status &&
      booking.status.toLowerCase() !== bookingData.status.toLowerCase() &&
      (bookingData.status.toLowerCase() === 'confirmed' ||
        bookingData.status.toLowerCase() === 'cancelled')
    ) {
      const customerEmail =
        updatedBooking.customer?.email ||
        updatedBooking.items[0]?.guests?.[0]?.email;
      const customerName = updatedBooking.customer
        ? `${updatedBooking.customer.firstName || updatedBooking.items[0].guests?.[0]?.firstName} ${updatedBooking.customer.lastName || updatedBooking.items[0].guests?.[0]?.lastName}`
        : undefined;

      await this.mailService.sendBookingStatusUpdateEmail(
        updatedBooking,
        bookingData.status,
        customerEmail,
        customerName,
      );
    }

    // Log action to database (if user information provided)
    if (actorId) {
      await this.actionLogService.logAction({
        actionType: 'update',
        feature: 'booking',
        subFeature: null,
        actorId,
        actorName: actorName || null,
        branchId: updatedBooking.branch?.id || null,
        oldData,
        newData: {
          id: updatedBooking.id,
          bookingId: updatedBooking.bookingId,
          status: updatedBooking.status,
          totalAmount: updatedBooking.totalAmount,
          branchId: updatedBooking.branch?.id || null,
        },
        entityType: 'booking',
        entityId: updatedBooking.id,
        description: `Updated booking: ${updatedBooking.bookingId}`,
        status: 'success',
      });
    }

    return updatedBooking;
  }

  async remove(
    id: string,
    actorId?: string,
    actorName?: string,
  ): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    // Capture data before deletion
    const deletedData = {
      id: booking.id,
      bookingId: booking.bookingId,
      status: booking.status,
      totalAmount: booking.totalAmount,
      branchId: booking.branch.id,
    };

    await this.bookingRepository.softDelete(id);

    // Log action to database (if user information provided)
    if (actorId) {
      await this.actionLogService.logAction({
        actionType: 'delete',
        feature: 'booking',
        subFeature: null,
        actorId,
        actorName: actorName || null,
        branchId: booking.branch?.id || null,
        oldData: deletedData,
        newData: null,
        entityType: 'booking',
        entityId: id,
        description: `Deleted booking: ${booking.bookingId}`,
        status: 'success',
      });
    }
  }

  async sendConfirmationEmail(bookingId: string): Promise<void> {
    const booking = await this.findOne(bookingId);
    const customerEmail = booking.customer?.email;
    const customerName = booking.customer
      ? `${booking.customer.firstName} ${booking.customer.lastName}`
      : undefined;
    await this.mailService.sendBookingConfirmationEmail(
      booking,
      customerEmail,
      customerName,
    );
  }

  async createBookingItem(
    bookingId: string,
    itemData: CreateBookingItemDto,
    actorId?: string,
    actorName?: string,
  ): Promise<BookingItem> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'branch', 'branch.spa'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // Fetch related entities by ID if IDs are provided
    let subService: SubService | undefined;
    let packageEntity: Package | undefined;
    let programme: Programme | undefined;
    let room: Room | undefined;
    let staff: Staff | undefined;

    if (itemData.subServiceId) {
      subService = await this.subServiceRepository.findOne({
        where: { id: itemData.subServiceId },
      });
    } else if (itemData.subService) {
      subService = itemData.subService;
    }

    if (itemData.packageId) {
      packageEntity = await this.packageRepository.findOne({
        where: { id: itemData.packageId },
      });
    } else if (itemData.package) {
      packageEntity = itemData.package;
    }

    if (itemData.programmeId) {
      programme = await this.programmeRepository.findOne({
        where: { id: itemData.programmeId },
      });
    } else if (itemData.programme) {
      programme = itemData.programme;
    }

    if (itemData.roomId) {
      room = await this.roomRepository.findOne({
        where: { id: itemData.roomId },
      });
    } else if (itemData.room) {
      room = itemData.room;
    }

    if (itemData.staffId) {
      staff = await this.staffRepository.findOne({
        where: { id: itemData.staffId },
      });
    } else if (itemData.staff) {
      staff = itemData.staff;
    }

    // Handle guest creation/linking
    const linkedGuests: Guest[] = [];

    this.logger.log(
      `[createBookingItem] guestData=${JSON.stringify(itemData.guestData)}, guests=${JSON.stringify(itemData.guests)}`,
    );

    if (itemData.guestData && itemData.guestData.length > 0) {
      // Create or find guests from guestData
      for (const guestDataItem of itemData.guestData) {
        if (guestDataItem?.id) {
          // Guest already exists, just link it
          const existingGuest = await this.guestRepository.findOne({
            where: { id: guestDataItem.id },
          });
          this.logger.log(
            `[createBookingItem] findOne by id=${guestDataItem.id} → ${existingGuest?.email ?? 'NOT FOUND'}`,
          );
          if (existingGuest) {
            linkedGuests.push(existingGuest);
          }
        } else if (
          guestDataItem?.email &&
          guestDataItem?.firstName &&
          guestDataItem?.lastName
        ) {
          // Try to find or create guest by email
          const whereCondition: any = {
            email: guestDataItem.email,
            spa: { id: itemData.spaId },
          };

          // Only add customer filter if booking has a customer
          if (booking.customer?.id) {
            whereCondition.customer = { id: booking.customer.id };
          } else {
            // If no customer, find guests with null customer
            whereCondition.customer = null;
          }

          let guest = await this.guestRepository.findOne({
            where: whereCondition,
          });

          if (!guest) {
            // Determine gender enum value
            let genderValue = EntityGuestGender.MALE;
            if (guestDataItem.gender) {
              const genderStr = String(guestDataItem.gender).toUpperCase();
              if (genderStr === 'FEMALE' || genderStr === 'MALE') {
                genderValue = genderStr.toLowerCase() as EntityGuestGender;
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
              customerId: booking.customer?.id,
            });
          } else {
            // update guest info
            await this.guestsService.update(guest.id, {
              firstName: guestDataItem.firstName || guest.firstName,
              lastName: guestDataItem.lastName || guest.lastName,
              phone: guestDataItem.phone || guest.phone,
              specialRequest:
                guestDataItem.specialRequest || guest.specialRequest,
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

        if (!guestId) continue;

        const guest = await this.guestRepository.findOne({
          where: { id: guestId },
        });
        if (guest) {
          linkedGuests.push(guest);
        }
      }
    }

    // Handle scheduledDate - convert string to Date if needed
    let scheduledDate: Date | undefined;
    if (itemData.scheduledDate) {
      if (typeof itemData.scheduledDate === 'string') {
        scheduledDate = new Date(itemData.scheduledDate);
      } else {
        scheduledDate = itemData.scheduledDate;
      }
    }

    // Resolve bed - can come as full object or as bed ID
    let resolvedBed = itemData.bed;
    if (itemData.bedId && !itemData.bed) {
      resolvedBed = { id: itemData.bedId };
    }

    this.logger.log(
      `[createBookingItem] linkedGuests count=${linkedGuests.length}, emails=${linkedGuests.map((g) => g.email).join(',')}`,
    );

    const bookingItem = this.bookingItemRepository.create({
      booking,
      itemType: itemData.itemType,
      quantity: itemData.quantity ?? 1,
      price: itemData.price,
      subtotal: itemData.subtotal,
      scheduledDate,
      scheduledTime: itemData.scheduledTime,
      notes: itemData.notes,
      duration: itemData.duration ?? 0,
      subService,
      package: packageEntity,
      programme,
      bed: resolvedBed,
      room,
      staff,
      guests: linkedGuests.length > 0 ? linkedGuests : undefined,
    });
    const savedBookingItem = await this.bookingItemRepository.save(bookingItem);

    // Log action to database (if user information provided)
    if (actorId) {
      await this.actionLogService.logAction({
        actionType: 'create',
        feature: 'booking',
        subFeature: 'booking_item',
        actorId,
        actorName: actorName || null,
        branchId: booking.branch.id || null,
        newData: {
          id: savedBookingItem.id,
          itemType: savedBookingItem.itemType,
          quantity: savedBookingItem.quantity,
          price: savedBookingItem.price,
          subtotal: savedBookingItem.subtotal,
          scheduledDate: savedBookingItem.scheduledDate,
        },
        entityType: 'booking_item',
        entityId: savedBookingItem.id,
        description: `Created booking item in booking: ${booking.bookingId}`,
        status: 'success',
      });
    }

    return savedBookingItem;
  }

  async updateBookingItem(
    itemId: string,
    itemData: UpdateBookingItemDto,
    actorId?: string,
    actorName?: string,
  ): Promise<BookingItem> {
    const oldBookingItem = await this.bookingItemRepository.findOne({
      where: { id: itemId },
      relations: ['guests', 'room', 'staff', 'bed'],
    });
    if (!oldBookingItem) throw new NotFoundException('Booking item not found');
    const updateData: any = {};
    let guestsToUpdate: any[] | undefined;

    if (itemData.itemType !== undefined)
      updateData.itemType = itemData.itemType;
    if (itemData.quantity !== undefined)
      updateData.quantity = itemData.quantity;
    if (itemData.price !== undefined) updateData.price = itemData.price;
    if (itemData.subtotal !== undefined)
      updateData.subtotal = itemData.subtotal;
    if (itemData.scheduledDate !== undefined) {
      // Handle scheduledDate - convert string to Date if needed
      if (typeof itemData.scheduledDate === 'string') {
        updateData.scheduledDate = new Date(itemData.scheduledDate);
      } else {
        updateData.scheduledDate = itemData.scheduledDate;
      }
    }
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

    // Store guests for separate handling (many-to-many)
    if (itemData.guestData !== undefined) {
      guestsToUpdate = itemData.guestData;
    } else if (itemData.guests !== undefined) {
      guestsToUpdate = itemData.guests;
    }

    // Handle bed fetching by bedId - similar to roomId handling
    if (itemData.bedId !== undefined) {
      if (itemData.bedId) {
        // Assuming beds have an entity, fetch it
        // If you don't have a bedRepository, you may need to add it
        // For now, just set the bedId as the bed relationship
        updateData.bed = { id: itemData.bedId };
      } else {
        updateData.bed = null;
      }
    }

    // Handle room fetching by roomId
    if (itemData.roomId !== undefined) {
      if (itemData.roomId) {
        const room = await this.roomRepository.findOne({
          where: { id: itemData.roomId },
        });
        if (room) {
          updateData.room = room;
        }
      } else {
        updateData.room = null;
      }
    } else if (itemData.room !== undefined) {
      updateData.room = itemData.room;
    }

    // Handle staff fetching by staffId
    if (itemData.staffId !== undefined) {
      if (itemData.staffId) {
        const staff = await this.staffRepository.findOne({
          where: { id: itemData.staffId },
        });
        if (staff) {
          updateData.staff = staff;
        }
      } else {
        updateData.staff = null;
      }
    } else if (itemData.staff !== undefined) {
      updateData.staff = itemData.staff;
    }

    await this.bookingItemRepository.update(itemId, updateData);

    // Handle many-to-many guest relationship separately
    if (guestsToUpdate !== undefined) {
      const linkedGuests: Guest[] = [];

      // Process guest data - update guest info and link them
      for (const guestItem of guestsToUpdate) {
        let guest: Guest | null = null;

        if (typeof guestItem === 'string') {
          // Just a guest ID, load it
          guest = await this.guestRepository.findOne({
            where: { id: guestItem },
          });
        } else if (guestItem && typeof guestItem === 'object') {
          if (guestItem.id) {
            // Guest with ID - might need update
            guest = await this.guestRepository.findOne({
              where: { id: guestItem.id },
            });

            // Update guest properties if provided
            if (
              guest &&
              (guestItem.firstName ||
                guestItem.lastName ||
                guestItem.phone ||
                guestItem.specialRequest)
            ) {
              await this.guestsService.update(guest.id, {
                firstName: guestItem.firstName || guest.firstName,
                lastName: guestItem.lastName || guest.lastName,
                phone: guestItem.phone || guest.phone,
                specialRequest:
                  guestItem.specialRequest || guest.specialRequest,
              });
              // Reload to get updated data
              guest = await this.guestRepository.findOne({
                where: { id: guestItem.id },
              });
            }
          } else if (
            guestItem.email &&
            guestItem.firstName &&
            guestItem.lastName
          ) {
            // New or existing guest by email
            guest = await this.guestRepository.findOne({
              where: { email: guestItem.email },
            });

            if (!guest) {
              // Create new guest
              let genderValue = EntityGuestGender.MALE;
              if (guestItem.gender) {
                const genderStr = String(guestItem.gender).toUpperCase();
                if (genderStr === 'FEMALE' || genderStr === 'MALE') {
                  genderValue = genderStr as EntityGuestGender;
                }
              }

              guest = await this.guestsService.create({
                firstName: guestItem.firstName || '',
                lastName: guestItem.lastName || '',
                email: guestItem.email || '',
                phone: guestItem.phone || undefined,
                nationality: guestItem.nationality || undefined,
                gender: genderValue,
                specialRequest: guestItem.specialRequest || undefined,
                spaId: itemData.spaId,
              });
            } else {
              // Update existing guest
              await this.guestsService.update(guest.id, {
                firstName: guestItem.firstName || guest.firstName,
                lastName: guestItem.lastName || guest.lastName,
                phone: guestItem.phone || guest.phone,
                specialRequest:
                  guestItem.specialRequest || guest.specialRequest,
              });
              guest = await this.guestRepository.findOne({
                where: { id: guest.id },
              });
            }
          }
        }

        if (guest) {
          linkedGuests.push(guest);
        }
      }

      // Now update the many-to-many relationship
      const guestIds = linkedGuests.map((g) => g.id);
      const relationQueryBuilder = this.bookingItemRepository
        .createQueryBuilder()
        .relation(BookingItem, 'guests')
        .of(itemId);

      // Remove all existing guests first
      try {
        const bookingItem = await this.bookingItemRepository.findOne({
          where: { id: itemId },
          relations: ['guests'],
        });

        if (
          bookingItem &&
          bookingItem.guests &&
          bookingItem.guests.length > 0
        ) {
          const existingGuestIds = bookingItem.guests.map((g) => g.id);
          await relationQueryBuilder.remove(existingGuestIds);
        }
      } catch (error) {
        // If there's an error loading, continue with adding new guests
      }

      // Add the new guests
      if (guestIds.length > 0) {
        await relationQueryBuilder.add(guestIds);
      }
    }

    const updatedItem = await this.bookingItemRepository.findOne({
      where: { id: itemId },
      relations: [
        'guests',
        'subService',
        'package',
        'programme',
        'bed',
        'room',
        'staff',
      ],
    });

    // Log action to database (if user information provided)
    if (actorId && updatedItem) {
      await this.actionLogService.logAction({
        actionType: 'update',
        feature: 'booking',
        subFeature: 'booking_item',
        actorId,
        actorName: actorName || null,
        branchId: updatedItem.booking?.branch?.id || null,
        oldData: oldBookingItem,
        newData: {
          id: updatedItem.id,
          itemType: updatedItem.itemType,
          quantity: updatedItem.quantity,
          price: updatedItem.price,
          subtotal: updatedItem.subtotal,
          scheduledDate: updatedItem.scheduledDate,
        },
        entityType: 'booking_item',
        entityId: updatedItem.id,
        description: `Updated booking item`,
        status: 'success',
      });
    }

    return updatedItem;
  }

  async deleteBookingItem(
    itemId: string,
    actorId?: string,
    actorName?: string,
  ): Promise<void> {
    const bookingItem = await this.bookingItemRepository.findOne({
      where: { id: itemId },
      relations: ['booking'],
    });

    const deletedData = bookingItem
      ? {
          id: bookingItem.id,
          itemType: bookingItem.itemType,
          quantity: bookingItem.quantity,
          price: bookingItem.price,
          subtotal: bookingItem.subtotal,
        }
      : null;

    await this.bookingItemRepository.delete(itemId);

    // Log action to database (if user information provided and bookingItem was found)
    if (actorId && bookingItem) {
      await this.actionLogService.logAction({
        actionType: 'delete',
        feature: 'booking',
        subFeature: 'booking_item',
        actorId,
        actorName: actorName || null,
        branchId: bookingItem.booking?.branch?.id || null,
        oldData: deletedData,
        newData: null,
        entityType: 'booking_item',
        entityId: itemId,
        description: `Deleted booking item`,
        status: 'success',
      });
    }
  }
}
