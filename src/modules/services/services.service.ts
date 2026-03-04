import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, DataSource, EntityManager } from 'typeorm';
import { Service } from 'src/entities/services.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { ServiceTranslation } from 'src/entities/service_translations.entity';
import { SubServiceTranslation } from 'src/entities/sub_service_translations.entity';
import { Branch } from 'src/entities/branch.entity';
import { ServiceCategory } from 'src/entities/service_categories.entity';
import { Media } from 'src/entities/media.entity';
import { Booking } from 'src/entities/bookings.entity';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import { PaginationParams } from 'src/shared/pagination.types';
import { CreateServiceDto, UpdateServiceDto } from './services.types';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    @InjectRepository(SubService)
    private subServiceRepo: Repository<SubService>,
    @InjectRepository(ServiceTranslation)
    private serviceTranslationRepo: Repository<ServiceTranslation>,
    @InjectRepository(SubServiceTranslation)
    private subServiceTranslationRepo: Repository<SubServiceTranslation>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(ServiceCategory)
    private categoryRepo: Repository<ServiceCategory>,
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
    @InjectRepository(Programme)
    private programmeRepo: Repository<Programme>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateServiceDto) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const branch = await manager.findOne(Branch, {
        where: { id: dto.branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
      }

      let category = null;
      if (dto.categoryId) {
        category = await manager.findOne(ServiceCategory, {
          where: { id: dto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${dto.categoryId} not found`,
          );
        }
      }

      const service = new Service();
      service.branch = branch;
      service.category = category;
      service.name = dto.name;
      service.description = dto.description;
      service.basePrice = dto.basePrice;
      service.durationMinutes = dto.durationMinutes;
      service.status = dto.status;
      service.maxConcurrentBookings = dto.maxConcurrentBookings;
      service.maxBookingsPerDay = dto.maxBookingsPerDay;

      const savedService = await manager.save(service);

      // Handle media associations
      if (dto.mediaIds && dto.mediaIds.length > 0) {
        const mediaList = await manager.find(Media, {
          where: { id: In(dto.mediaIds) },
        });

        for (const media of mediaList) {
          media.service = savedService;
          await manager.save(media);
        }
      }

      // Create translations
      if (dto.translations && dto.translations.length > 0) {
        const translations = dto.translations.map((t) => {
          const translation = new ServiceTranslation();
          translation.service = savedService;
          translation.languageCode = t.languageCode;
          translation.name = t.name;
          translation.description = t.description;
          return translation;
        });
        await manager.save(translations);
      }

      // Create sub-services
      if (dto.subServices && dto.subServices.length > 0) {
        for (const subServiceDto of dto.subServices) {
          const subService = new SubService();
          subService.service = savedService;
          subService.name = subServiceDto.name;
          subService.durationMinutes = subServiceDto.durationMinutes;
          subService.price = subServiceDto.price;
          subService.status = subServiceDto.status;

          const savedSubService = await manager.save(subService);

          // Create sub-service translations
          if (
            subServiceDto.translations &&
            subServiceDto.translations.length > 0
          ) {
            const subServiceTranslations = subServiceDto.translations.map(
              (t) => {
                const translation = new SubServiceTranslation();
                translation.subService = savedSubService;
                translation.languageCode = t.languageCode;
                translation.name = t.name;
                translation.description = t.description;
                return translation;
              },
            );
            await manager.save(subServiceTranslations);
          }
        }
      }

      return savedService;
    });
  }

  async findAll(
    branchId: string,
    filters?: { search?: string; categoryId?: string },
    paginationParams?: PaginationParams,
  ) {
    // Build query with filters
    let query = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.branchId = :branchId', { branchId })
      .andWhere('service.deletedAt IS NULL')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.subServices', 'subServices')
      .leftJoinAndSelect('subServices.translations', 'subServiceTranslations')
      .leftJoinAndSelect('service.translations', 'translations')
      .leftJoinAndSelect('service.media', 'media')
      .orderBy('service.createdAt', 'DESC')
      .addOrderBy('media.createdAt', 'ASC');

    // Apply search filter
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: searchTerm },
      );
    }

    // Apply category filter
    if (filters?.categoryId) {
      query = query.andWhere('service.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    // Handle pagination
    if (!paginationParams) {
      // Fallback to non-paginated response for backward compatibility
      return await query.getMany();
    }

    const { skip, take } = getPaginationQueryTypeORM(paginationParams);
    const [results, totalCount] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginate(paginationParams, totalCount, results);
  }

  async findOne(id: string) {
    const service = await this.serviceRepo.findOne({
      where: { id, deletedAt: null },
      relations: [
        'category',
        'subServices',
        'subServices.translations',
        'translations',
        'media',
        'branch',
        'branch.operatingHours',
      ],
      order: {
        media: { createdAt: 'ASC' },
        subServices: {
          durationMinutes: 'ASC',
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const service = await manager.findOne(Service, {
        where: { id },
        relations: [
          'category',
          'subServices',
          'subServices.translations',
          'translations',
        ],
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      if (dto.categoryId) {
        const category = await manager.findOne(ServiceCategory, {
          where: { id: dto.categoryId },
        });
        if (!category) {
          throw new NotFoundException('Category not found');
        }
        service.category = category;
      }

      if (dto.name) service.name = dto.name;
      if (dto.description !== undefined) service.description = dto.description;
      if (dto.basePrice !== undefined) service.basePrice = dto.basePrice;
      if (dto.durationMinutes !== undefined)
        service.durationMinutes = dto.durationMinutes;
      if (dto.status) service.status = dto.status;
      if (dto.maxConcurrentBookings !== undefined)
        service.maxConcurrentBookings = dto.maxConcurrentBookings;
      if (dto.maxBookingsPerDay !== undefined)
        service.maxBookingsPerDay = dto.maxBookingsPerDay;

      await manager.save(service);

      // Handle media associations - only update what changed
      if (dto.mediaIds !== undefined) {
        // Get existing media IDs for this service
        const existingMedia = await manager.find(Media, {
          where: { service: { id } },
        });
        const existingMediaIds = new Set(existingMedia.map((m) => m.id));
        const incomingMediaIds = new Set(dto.mediaIds);

        // Find media to remove (was in existing, not in incoming)
        const mediaToRemove = existingMedia.filter(
          (media) => !incomingMediaIds.has(media.id),
        );

        // Find media to add (in incoming, not in existing)
        const mediaIdsToAdd = Array.from(incomingMediaIds).filter(
          (id) => !existingMediaIds.has(id),
        );

        // Remove media no longer associated with this service
        for (const media of mediaToRemove) {
          media.service = null;
          await manager.save(media);
        }

        // Add new media associations
        if (mediaIdsToAdd.length > 0) {
          const mediaList = await manager.find(Media, {
            where: { id: In(mediaIdsToAdd) },
          });

          for (const media of mediaList) {
            media.service = service;
            await manager.save(media);
          }
        }
      }

      // Update translations
      if (dto.translations && dto.translations.length > 0) {
        await manager.delete(ServiceTranslation, { service: { id } });
        const translations = dto.translations.map((t) => {
          const translation = new ServiceTranslation();
          translation.service = service;
          translation.languageCode = t.languageCode;
          translation.name = t.name;
          translation.description = t.description;
          return translation;
        });
        await manager.save(translations);
      }

      // Update sub-services
      if (dto.subServices && dto.subServices.length > 0) {
        const incomingIds = dto.subServices
          .filter((s) => s.id)
          .map((s) => s.id);
        if (incomingIds.length > 0) {
          await manager.delete(SubService, {
            service: { id },
            id: Not(In(incomingIds)),
          });
        } else {
          await manager.delete(SubService, { service: { id } });
        }

        for (const subServiceDto of dto.subServices) {
          if (subServiceDto.id) {
            const subService = await manager.findOne(SubService, {
              where: { id: subServiceDto.id },
            });
            if (subService) {
              if (subServiceDto.name) subService.name = subServiceDto.name;
              if (subServiceDto.durationMinutes !== undefined)
                subService.durationMinutes = subServiceDto.durationMinutes;
              if (subServiceDto.price !== undefined)
                subService.price = subServiceDto.price;
              if (subServiceDto.status)
                subService.status = subServiceDto.status;

              await manager.save(subService);

              // Update translations
              if (
                subServiceDto.translations &&
                subServiceDto.translations.length > 0
              ) {
                await manager.delete(SubServiceTranslation, {
                  subService: { id: subServiceDto.id },
                });
                const translations = subServiceDto.translations.map((t) => {
                  const translation = new SubServiceTranslation();
                  translation.subService = subService;
                  translation.languageCode = t.languageCode;
                  translation.name = t.name;
                  translation.description = t.description;
                  return translation;
                });
                await manager.save(translations);
              }
            }
          } else {
            const subService = new SubService();
            subService.service = service;
            subService.name = subServiceDto.name;
            subService.durationMinutes = subServiceDto.durationMinutes;
            subService.price = subServiceDto.price;
            subService.status = subServiceDto.status;

            const savedSubService = await manager.save(subService);

            if (
              subServiceDto.translations &&
              subServiceDto.translations.length > 0
            ) {
              const translations = subServiceDto.translations.map((t) => {
                const translation = new SubServiceTranslation();
                translation.subService = savedSubService;
                translation.languageCode = t.languageCode;
                translation.name = t.name;
                translation.description = t.description;
                return translation;
              });
              await manager.save(translations);
            }
          }
        }
      }

      return this.findOne(id);
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify service exists
    await this.serviceRepo.softDelete(id);
    return { success: true, message: 'Service deleted successfully' };
  }

  async removeSubService(subServiceId: string) {
    const subService = await this.subServiceRepo.findOne({
      where: { id: subServiceId },
    });
    if (!subService) {
      throw new NotFoundException('Sub-service not found');
    }
    await this.subServiceRepo.softDelete(subServiceId);
    return { success: true, message: 'Sub-service deleted successfully' };
  }

  async getServiceCategories(branchId: string) {
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return await this.categoryRepo.find({
      where: {
        branch: { id: branchId },
        isActive: true,
      },
      relations: ['translations'],
      order: { name: 'ASC' },
    });
  }

  async countBookingsByServiceAndTime(filters: {
    serviceId: string;
    serviceType: 'services' | 'packages' | 'programs';
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'hour'; // 'day' or 'hour' grouping
  }) {
    const { serviceId, startDate, endDate, groupBy = 'day' } = filters;

    // Verify service exists and get applicable service IDs and packages
    let applicableServiceIds: string[] = [];
    let applicablePackageIds: string[] = [];
    let packageBookingData: any = null;

    if (filters.serviceType === 'packages') {
      const packageData = await this.packageRepo.findOne({
        where: { id: serviceId },
        relations: ['subServices'],
      });
      if (!packageData) {
        throw new NotFoundException('Package not found');
      }
      // Get all subService IDs from the package
      applicableServiceIds = packageData.subServices.map((sub) => sub.id);

      // Get the package booking to find its actual time window
      const packageBooking = await this.bookingRepo.findOne({
        where: { package: { id: serviceId }, deletedAt: null },
        order: { startDateTime: 'ASC', endDateTime: 'DESC' },
      });
      if (packageBooking) {
        packageBookingData = {
          startTime: packageBooking.startDateTime,
          endTime: packageBooking.endDateTime,
        };
      }
    } else if (filters.serviceType === 'programs') {
      const programme = await this.programmeRepo.findOne({
        where: { id: serviceId },
      });
      if (!programme) {
        throw new NotFoundException('Programme not found');
      }
      // For programme, we search by the programme ID itself
      applicableServiceIds = [];
    } else {
      const service = await this.serviceRepo.findOne({
        where: { id: serviceId },
        relations: ['subServices'],
      });
      if (!service) {
        throw new NotFoundException('Service not found');
      }
      // For a single service, get all its sub-services
      applicableServiceIds = service.subServices.map((sub) => sub.id);

      // Also find all packages that include any of these sub-services
      if (applicableServiceIds.length > 0) {
        const packagesWithService = await this.packageRepo.find({
          relations: ['subServices'],
        });
        applicablePackageIds = packagesWithService
          .filter((pkg) =>
            pkg.subServices?.some((sub) =>
              applicableServiceIds.includes(sub.id),
            ),
          )
          .map((pkg) => pkg.id);
      }
    }

    let query = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoin('booking.subService', 'subService')
      .leftJoin('booking.package', 'package')
      .leftJoin('booking.programme', 'programme')
      .leftJoinAndSelect('booking.guests', 'guests')
      .where('booking.deletedAt IS NULL');

    // Apply filters based on service type
    if (filters.serviceType === 'packages') {
      // For packages, count:
      // 1. Direct package bookings (booking.package = packageId)
      // 2. Bookings for all subservices in the package that overlap with package time
      if (applicableServiceIds.length > 0) {
        query = query.andWhere(
          '(package.id = :serviceId OR subService.id IN (:...applicableServiceIds))',
          { serviceId, applicableServiceIds },
        );
      } else {
        // If package has no subservices, only check for direct package bookings
        query = query.andWhere('package.id = :serviceId', { serviceId });
      }
    } else if (filters.serviceType === 'programs') {
      // For programmes, search by programme ID
      query = query.andWhere('programme.id = :serviceId', { serviceId });
    } else {
      // For single services, count:
      // 1. Bookings for all sub-services within that service
      // 2. Bookings of packages that include any of these sub-services
      if (applicableServiceIds.length > 0) {
        if (applicablePackageIds.length > 0) {
          query = query.andWhere(
            '(subService.id IN (:...applicableServiceIds) OR package.id IN (:...applicablePackageIds))',
            { applicableServiceIds, applicablePackageIds },
          );
        } else {
          query = query.andWhere(
            'subService.id IN (:...applicableServiceIds)',
            { applicableServiceIds },
          );
        }
      } else {
        // Service has no sub-services, return no results
        query = query.andWhere('1=0');
      }
    }

    // Apply date filters if provided
    if (startDate) {
      startDate.setHours(0, 0, 0, 0); // Start of the day
      query = query.andWhere('booking.start_date_time >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // End of the day
      query = query.andWhere('booking.end_date_time <= :endDate', { endDate });
    }

    // For services type, get actual booking times to consolidate overlaps
    if (filters.serviceType === 'services') {
      query = query
        .select('booking.start_date_time', 'startTimeSlot')
        .addSelect('booking.end_date_time', 'endTimeSlot')
        .addSelect('booking.id', 'bookingId')
        .orderBy('booking.start_date_time', 'ASC')
        .addOrderBy('booking.end_date_time', 'ASC');

      const allBookings = await query.getRawMany();

      // Consolidate overlapping bookings
      const consolidatedSlots: Array<{
        startTimeSlot: Date;
        endTimeSlot: Date;
        bookings: string[];
      }> = [];

      for (const booking of allBookings) {
        const bookingStart = new Date(booking.startTimeSlot);
        const bookingEnd = new Date(booking.endTimeSlot);

        let merged = false;

        // Check if this booking overlaps with any existing slot
        for (const slot of consolidatedSlots) {
          const slotStart = new Date(slot.startTimeSlot);
          const slotEnd = new Date(slot.endTimeSlot);

          // Check for overlap: booking starts before slot ends AND booking ends after slot starts
          if (bookingStart < slotEnd && bookingEnd > slotStart) {
            // Merge: expand the slot to include the new booking
            slot.startTimeSlot = new Date(
              Math.min(slotStart.getTime(), bookingStart.getTime()),
            );
            slot.endTimeSlot = new Date(
              Math.max(slotEnd.getTime(), bookingEnd.getTime()),
            );
            slot.bookings.push(booking.bookingId);
            merged = true;
            break;
          }
        }

        // If no overlap found, create a new slot
        if (!merged) {
          consolidatedSlots.push({
            startTimeSlot: bookingStart,
            endTimeSlot: bookingEnd,
            bookings: [booking.bookingId],
          });
        }
      }

      // Further consolidate slots that now overlap after the initial merge
      let hasChanges = true;
      while (hasChanges) {
        hasChanges = false;
        for (let i = 0; i < consolidatedSlots.length; i++) {
          for (let j = i + 1; j < consolidatedSlots.length; j++) {
            const slot1 = consolidatedSlots[i];
            const slot2 = consolidatedSlots[j];

            const slot1Start = new Date(slot1.startTimeSlot);
            const slot1End = new Date(slot1.endTimeSlot);
            const slot2Start = new Date(slot2.startTimeSlot);
            const slot2End = new Date(slot2.endTimeSlot);

            // Check for overlap
            if (slot1Start < slot2End && slot1End > slot2Start) {
              // Merge slots
              slot1.startTimeSlot = new Date(
                Math.min(slot1Start.getTime(), slot2Start.getTime()),
              );
              slot1.endTimeSlot = new Date(
                Math.max(slot1End.getTime(), slot2End.getTime()),
              );
              slot1.bookings = [...slot1.bookings, ...slot2.bookings];
              consolidatedSlots.splice(j, 1);
              hasChanges = true;
              break;
            }
          }
          if (hasChanges) break;
        }
      }

      // Convert to response format
      const results = consolidatedSlots.map((slot) => ({
        startTimeSlot: slot.startTimeSlot,
        endTimeSlot: slot.endTimeSlot,
        count: slot.bookings.length,
      }));

      return {
        serviceId,
        groupBy,
        total: allBookings.length,
        data: results,
      };
    }

    // Group by day or hour for other service types
    if (groupBy === 'hour') {
      query = query
        .select("DATE_TRUNC('hour', booking.start_date_time)", 'startTimeSlot')
        .addSelect("DATE_TRUNC('hour', booking.end_date_time)", 'endTimeSlot')
        .addSelect('COUNT(DISTINCT booking.id)', 'count')
        .groupBy("DATE_TRUNC('hour', booking.start_date_time)")
        .addGroupBy("DATE_TRUNC('hour', booking.end_date_time)");
    } else {
      query = query
        .select('DATE(booking.start_date_time)', 'startTimeSlot')
        .addSelect('DATE(booking.end_date_time)', 'endTimeSlot')
        .addSelect('COUNT(DISTINCT booking.id)', 'count')
        .groupBy('DATE(booking.start_date_time)')
        .addGroupBy('DATE(booking.end_date_time)');
    }

    query = query
      .orderBy(
        groupBy === 'hour'
          ? "DATE_TRUNC('hour', booking.start_date_time)"
          : 'DATE(booking.start_date_time)',
        'ASC',
      )
      .addOrderBy(
        groupBy === 'hour'
          ? "DATE_TRUNC('hour', booking.end_date_time)"
          : 'DATE(booking.end_date_time)',
        'ASC',
      );

    let results = await query.getRawMany();

    // For package type with hour grouping, consolidate results to use the actual time window
    if (
      filters.serviceType === 'packages' &&
      groupBy === 'hour' &&
      packageBookingData
    ) {
      const totalCount = results.reduce(
        (sum, r) => sum + parseInt(r.count, 10),
        0,
      );
      results = [
        {
          startTimeSlot: packageBookingData.startTime,
          endTimeSlot: packageBookingData.endTime,
          count: totalCount,
        },
      ];
    }

    return {
      serviceId,
      groupBy,
      total: results.reduce((sum, r) => sum + parseInt(r.count, 10), 0),
      data: results.map((r) => ({
        startTimeSlot: r.startTimeSlot,
        endTimeSlot: r.endTimeSlot,
        count: parseInt(r.count, 10),
      })),
    };
  }
}
