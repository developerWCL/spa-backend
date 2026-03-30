import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Booking } from '../../entities/bookings.entity';
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
  ) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    // Generate a unique booking ID: Branch code + running number
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
          branchName
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
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
    const bookingId = `${branchCode}-${runningNumber}`;

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
      .where('booking.branchId = :branchId', { branchId })
      .andWhere('payments.status != :paidStatus', { paidStatus: 'failed' });

    if (status && status !== 'all') {
      query = query.andWhere('booking.status = :status', { status });
    }

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(customer.firstName) LIKE :search', {
            search: searchTerm,
          })
            .orWhere('LOWER(customer.lastName) LIKE :search', {
              search: searchTerm,
            })
            .orWhere('LOWER(booking.bookingId) LIKE :search', {
              search: searchTerm,
            });
        }),
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
        'items.staff',
        'items.room',
        'items.guests',
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

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    // Separate items and payments data from booking data
    const { items, payments, ...bookingData } = data;
    // update payments if provided
    if (payments && Array.isArray(payments)) {
      for (const payment of payments) {
        if (payment.id) {
          // Update existing payment
          await this.paymentRepository.update(payment.id, {
            amount: payment.amount,
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
          await this.updateBookingItem(itemId, updateItemData);
        } else {
          // Create new item
          await this.createBookingItem(id, itemData);
        }
      }
    }

    // Get the updated booking with all details
    const updatedBooking = await this.findOne(id);

    // Send status update email if status changed to confirmed or cancelled
    if (
      bookingData.status &&
      updatedBooking.status !== bookingData.status &&
      (bookingData.status.toLowerCase() === 'confirmed' ||
        bookingData.status.toLowerCase() === 'cancelled')
    ) {
      const customerEmail = updatedBooking.customer?.email;
      const customerName = updatedBooking.customer
        ? `${updatedBooking.customer.firstName} ${updatedBooking.customer.lastName}`
        : undefined;

      await this.mailService.sendBookingStatusUpdateEmail(
        updatedBooking,
        bookingData.status,
        customerEmail,
        customerName,
      );
    }

    return updatedBooking;
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
              if (genderStr === 'FEMALE' || genderStr === 'MALE') {
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
    const savedItem = await this.bookingItemRepository.save(bookingItem);
    // Load booking with customer and items/guests for email sending
    const bookingWithDetails = await this.findOne(booking.id);

    // Send booking confirmation email
    // If customer exists, send to customer email; otherwise send to first guest email
    const customerEmail = bookingWithDetails.customer?.email;
    const customerName = bookingWithDetails.customer
      ? `${bookingWithDetails.customer.firstName} ${bookingWithDetails.customer.lastName}`
      : undefined;

    await this.mailService.sendBookingConfirmationEmail(
      bookingWithDetails,
      customerEmail,
      customerName,
    );

    // Send booking notification email to branch admin
    if (bookingWithDetails.branch?.email) {
      await this.mailService.sendBookingNotificationToAdmin(
        bookingWithDetails,
        bookingWithDetails.branch.email,
        bookingWithDetails.branch.name,
      );
    }

    return savedItem;
  }

  async updateBookingItem(
    itemId: string,
    itemData: UpdateBookingItemDto,
  ): Promise<BookingItem> {
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

    return this.bookingItemRepository.findOne({
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
  }

  async deleteBookingItem(itemId: string): Promise<void> {
    await this.bookingItemRepository.delete(itemId);
  }
}
