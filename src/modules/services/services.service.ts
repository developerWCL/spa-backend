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
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import { PriceOverride } from 'src/entities/price_overides.entity';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';

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
    private logger: AppLoggerService,
    private actionLogService: ActionLogService,
  ) {
    this.logger.setContext('ServicesService');
  }

  async create(dto: CreateServiceDto, actorId?: string, actorName?: string) {
    // Normalize branchId to array
    const branchIds = Array.isArray(dto.branchId)
      ? dto.branchId
      : [dto.branchId];

    this.logger.log('Creating service', {
      name: dto.name,
      branchIds,
      totalBranches: branchIds.length,
    });

    const createdServices = [];
    for (const branchId of branchIds) {
      const service = await this.dataSource.transaction(
        async (manager: EntityManager) => {
          const branch = await manager.findOne(Branch, {
            where: { id: branchId },
          });
          if (!branch) {
            this.logger.error('Branch not found', null, { branchId });
            throw new NotFoundException(`Branch with ID ${branchId} not found`);
          }

          let category = null;
          if (dto.categoryId) {
            const existingCategory = await manager.findOne(ServiceCategory, {
              where: { id: dto.categoryId },
            });
            category = await manager.findOne(ServiceCategory, {
              where: { name: existingCategory.name, branch: { id: branchId } },
            });
            if (!category) {
              // create new category if it doesn't exist for this branch
              category = manager.create(ServiceCategory, {
                name: existingCategory.name || 'Uncategorized',
                description: existingCategory.description,
                branch: branch,
              });
              category = await manager.save(category);
            }
          }

          const newService = new Service();
          newService.branch = branch;
          newService.category = category;
          newService.name = dto.name;
          newService.description = dto.description;
          newService.basePrice = dto.basePrice;
          newService.durationMinutes = dto.durationMinutes;
          newService.maxConcurrentBookings = dto.maxConcurrentBookings;
          newService.maxBookingsPerDay = dto.maxBookingsPerDay;
          if (branchId === dto.mainBranchId) {
            newService.status = dto.status;
          } else {
            newService.status = EntityStatus.INACTIVE; // Set to inactive for non-main branches
          }

          const savedService = await manager.save(newService);
          this.logger.log('Service created successfully', {
            serviceId: savedService.id,
            name: savedService.name,
            branchId,
          });

          // Handle media associations
          if (dto.mediaIds && dto.mediaIds.length > 0) {
            const mediaList = await manager.find(Media, {
              where: { id: In(dto.mediaIds) },
            });

            for (const media of mediaList) {
              // Create a new media copy for this branch's service
              const newMedia = manager.create(Media, {
                url: media.url,
                type: media.type,
                filename: media.filename,
                mimeType: media.mimeType,
                service: savedService,
              });
              await manager.save(newMedia);
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

          // Log the action
          await this.actionLogService.logAction({
            feature: 'service',
            subFeature: null,
            actionType: 'create',
            actorId,
            actorName,
            entityType: 'service',
            entityId: savedService.id,
            newData: {
              name: savedService.name,
              description: savedService.description,
              basePrice: savedService.basePrice,
              durationMinutes: savedService.durationMinutes,
              status: savedService.status,
              maxConcurrentBookings: savedService.maxConcurrentBookings,
              maxBookingsPerDay: savedService.maxBookingsPerDay,
              categoryId: category?.id,
            },
            description: `Created service: ${savedService.name}`,
            status: 'success',
            branchId,
          });

          return savedService;
        },
      );

      createdServices.push(service);
    }

    this.logger.log('Service creation completed', {
      name: dto.name,
      totalServicesCreated: createdServices.length,
    });

    // Return the first created service (or all if needed)
    return createdServices[0];
  }

  async findAll(
    branchId: string,
    filters?: {
      search?: string;
      categoryId?: string;
      status?: EntityStatus;
      onlyPackage?: boolean;
      minDurationMinutes?: number;
      maxDurationMinutes?: number;
      promotionId?: string;
    },
    paginationParams?: PaginationParams,
  ) {
    // Build query with filters
    let query = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.deletedAt IS NULL')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.branch', 'branch')
      .leftJoinAndSelect('branch.spa', 'spa')
      .leftJoinAndSelect('service.subServices', 'subServices')
      .leftJoinAndSelect('subServices.translations', 'subServiceTranslations')
      .leftJoinAndSelect('service.translations', 'translations')
      .leftJoinAndSelect('service.media', 'media')
      .orderBy('service.createdAt', 'DESC')
      .addOrderBy('media.createdAt', 'ASC');

    if (branchId) {
      query = query.andWhere('service.branchId = :branchId', { branchId });
    }

    if (filters?.promotionId) {
      // Filter services that are included in the specified promotion
      const promotionServiceSubQuery = this.dataSource
        .createQueryBuilder()
        .select('ps.serviceId')
        .from('promotion_services', 'ps')
        .where('ps.promotionId = :promotionId', {
          promotionId: filters.promotionId,
        });
      query = query.andWhere(
        `service.id IN (${promotionServiceSubQuery.getQuery()})`,
        promotionServiceSubQuery.getParameters(),
      );
    }

    if (filters?.minDurationMinutes !== undefined) {
      // Only return services that have at least one subService meeting the duration criteria
      const subQuery = this.subServiceRepo
        .createQueryBuilder('ss')
        .select('ss.serviceId')
        .where('ss.durationMinutes >= :minDurationMinutes', {
          minDurationMinutes: filters.minDurationMinutes,
        });
      query = query.andWhere(
        `service.id IN (${subQuery.getQuery()})`,
        subQuery.getParameters(),
      );
    }

    if (filters?.maxDurationMinutes !== undefined) {
      // Only return services that have at least one subService meeting the duration criteria
      const subQuery = this.subServiceRepo
        .createQueryBuilder('ss')
        .select('ss.serviceId')
        .where('ss.durationMinutes <= :maxDurationMinutes', {
          maxDurationMinutes: filters.maxDurationMinutes,
        });
      query = query.andWhere(
        `service.id IN (${subQuery.getQuery()})`,
        subQuery.getParameters(),
      );
    }
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

    if (filters?.status) {
      query = query.andWhere('service.status = :status', {
        status: filters.status,
      });
    }
    if (filters?.onlyPackage !== undefined) {
      const onlyPackage = Boolean(filters.onlyPackage);
      if (onlyPackage === true) {
        query = query.andWhere('service.name != :name', {
          name: 'PACKAGE ONLY',
        });
      }
    }

    // Handle pagination
    if (!paginationParams) {
      // Fallback to non-paginated response for backward compatibility
      const data = await query.getMany();
      const dataWithLink = data.map((service) => {
        return {
          ...service,
          link: `${service.branch.spa.bookingEngineUrl}/${service.branch.spa.id}?branchId=${service.branch.id}&serviceId=${service.id}&serviceType=services`,
        };
      });
      return dataWithLink;
    }
    const paginationQuery = getPaginationQueryTypeORM(paginationParams);

    // Get paginated service IDs first (to handle joins correctly)
    const [data, total] = await query
      .take(paginationQuery.take)
      .skip(paginationQuery.skip)
      .getManyAndCount();
    const totalCount = await query.getCount();
    //orientalaspa.webconnection.app/aed498b0-b67d-4a3d-a569-1d1b2dad685b?branchId=35870acd-2787-4232-9eeb-bdcc098e05b4&serviceId=903eac8a-ea41-404e-92f5-eaa3f3185c97&serviceType=services
    const dataWithLink = data.map((service) => {
      return {
        ...service,
        link: `${service.branch.spa.bookingEngineUrl}/${service.branch.spa.id}?branchId=${service.branch.id}&serviceId=${service.id}&serviceType=services`,
      };
    });

    return paginate(paginationParams, totalCount, dataWithLink);
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
      this.logger.warn('Service not found', { serviceId: id });
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
    actorId?: string,
    actorName?: string,
  ) {
    this.logger.log('Updating service', { serviceId: id });
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const service = await manager.findOne(Service, {
        where: { id },
        relations: [
          'category',
          'subServices',
          'subServices.translations',
          'translations',
          'branch',
        ],
      });

      if (!service) {
        this.logger.error('Service not found for update', null, {
          serviceId: id,
        });
        throw new NotFoundException('Service not found');
      }

      // Store old data for audit trail
      const oldService = {
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        durationMinutes: service.durationMinutes,
        status: service.status,
        maxConcurrentBookings: service.maxConcurrentBookings,
        maxBookingsPerDay: service.maxBookingsPerDay,
      };

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
              if (subServiceDto.price !== undefined) {
                subService.price = subServiceDto.price;
                if (dto.isOverride !== undefined && dto.isOverride === true) {
                  // soft delete existing price overrides for this sub-service
                  await manager.softDelete(PriceOverride, {
                    subService: In(service.subServices.map((sub) => sub.id)),
                  });
                }
              }
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

      this.logger.log('Service updated successfully', { serviceId: id });

      // Log the action
      await this.actionLogService.logAction({
        feature: 'service',
        subFeature: null,
        actionType: 'update',
        actorId,
        actorName,
        entityType: 'service',
        entityId: id,
        oldData: oldService,
        newData: {
          name: service.name,
          description: service.description,
          basePrice: service.basePrice,
          durationMinutes: service.durationMinutes,
          status: service.status,
          maxConcurrentBookings: service.maxConcurrentBookings,
          maxBookingsPerDay: service.maxBookingsPerDay,
        },
        description: `Updated service: ${service.name}`,
        status: 'success',
        branchId: service.branch?.id || null,
      });

      return this.findOne(id);
    });
  }

  async remove(id: string, actorId?: string, actorName?: string) {
    this.logger.log('Deleting service', { serviceId: id });
    const service = await this.findOne(id); // Verify service exists

    // Log the action
    await this.actionLogService.logAction({
      feature: 'service',
      subFeature: null,
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'service',
      entityId: id,
      oldData: {
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        durationMinutes: service.durationMinutes,
        status: service.status,
      },
      description: `Deleted service: ${service.name}`,
      status: 'success',
      branchId: service.branch?.id || null,
    });

    await this.serviceRepo.softDelete(id);
    this.logger.log('Service deleted successfully', { serviceId: id });
    return { success: true, message: 'Service deleted successfully' };
  }

  async removeSubService(
    subServiceId: string,
    actorId?: string,
    actorName?: string,
  ) {
    this.logger.log('Deleting sub-service', { subServiceId });
    const subService = await this.subServiceRepo.findOne({
      where: { id: subServiceId },
      relations: ['service', 'service.branch'],
    });
    if (!subService) {
      this.logger.warn('Sub-service not found', { subServiceId });
      throw new NotFoundException('Sub-service not found');
    }

    // Log the action
    await this.actionLogService.logAction({
      feature: 'service',
      subFeature: null,
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'sub_service',
      entityId: subServiceId,
      oldData: {
        name: subService.name,
        price: subService.price,
        durationMinutes: subService.durationMinutes,
        status: subService.status,
        serviceId: subService.service?.id,
      },
      description: `Deleted sub-service: ${subService.name}`,
      status: 'success',
      branchId: subService.service?.branch?.id || null,
    });

    await this.subServiceRepo.softDelete(subServiceId);
    this.logger.log('Sub-service deleted successfully', { subServiceId });
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

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
      const packageBooking = await this.bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.items', 'items')
        .leftJoinAndSelect('items.package', 'package')
        .where('package.id = :packageId', { packageId: serviceId })
        .andWhere('booking.deletedAt IS NULL')
        .getOne();
      if (packageBooking) {
        // Loop through all booking items to calculate time window
        let earliestStart: Date | null = null;
        let latestEnd: Date | null = null;

        if (packageBooking.items && packageBooking.items.length > 0) {
          for (const bookingItem of packageBooking.items) {
            if (bookingItem.scheduledDate && bookingItem.scheduledTime) {
              // Combine scheduledDate and scheduledTime to create start time
              const startDateTime = new Date(bookingItem.scheduledDate);
              const timeParts = bookingItem.scheduledTime.split(':');
              if (timeParts.length >= 2) {
                startDateTime.setHours(
                  parseInt(timeParts[0], 10),
                  parseInt(timeParts[1], 10),
                  timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0,
                );
              }

              // Get duration from the numeric value
              const durationMinutes =
                typeof bookingItem.duration === 'string'
                  ? parseInt(bookingItem.duration, 10)
                  : bookingItem.duration || 0;

              // Calculate endTime as startTime + duration
              const endDateTime = new Date(
                startDateTime.getTime() + durationMinutes * 60000,
              );

              // Update earliest start and latest end
              if (
                !earliestStart ||
                startDateTime.getTime() < earliestStart.getTime()
              ) {
                earliestStart = startDateTime;
              }
              if (!latestEnd || endDateTime.getTime() > latestEnd.getTime()) {
                latestEnd = endDateTime;
              }
            }
          }
        }

        // Use calculated times if available, otherwise try to get from booking without items
        if (earliestStart && latestEnd) {
          packageBookingData = {
            startTime: earliestStart,
            endTime: latestEnd,
          };
        } else {
          // No timing information available
          packageBookingData = null;
        }
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
      .leftJoin('booking.items', 'items')
      .leftJoin('items.subService', 'subService')
      .leftJoin('items.package', 'package')
      .leftJoin('items.programme', 'programme')
      .leftJoinAndSelect('items.guests', 'guests')
      .where('booking.deletedAt IS NULL');

    // Apply filters based on service type
    if (filters.serviceType === 'packages') {
      // For packages, count:
      // 1. Direct package bookings (items.package = packageId)
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
      query = query.andWhere('items.scheduledDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      query = query.andWhere('items.scheduledDate <= :endDate', { endDate });
    }

    // For services type, get actual booking times to consolidate overlaps
    if (filters.serviceType === 'services') {
      query = query
        .select('items.scheduledDate', 'scheduledDate')
        .addSelect('items.scheduledTime', 'scheduledTime')
        .addSelect('items.duration', 'duration')
        .addSelect('booking.id', 'bookingId')
        .addSelect('items.subServiceId', 'subServiceId')
        .orderBy('items.scheduledDate', 'ASC')
        .addOrderBy('items.scheduledTime', 'ASC');

      const allBookings = await query.getRawMany();
      console.log('allBookings', allBookings);

      // Consolidate overlapping bookings
      const consolidatedSlots: Array<{
        startTimeSlot: Date;
        endTimeSlot: Date;
        bookings: string[];
      }> = [];

      for (const booking of allBookings) {
        // Calculate start time from scheduledDate and scheduledTime
        const bookingStart = new Date(booking.scheduledDate);
        const timeParts = booking.scheduledTime.split(':');
        if (timeParts.length >= 2) {
          bookingStart.setHours(
            parseInt(timeParts[0], 10),
            parseInt(timeParts[1], 10),
            timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0,
          );
        }

        // Calculate end time as start + duration
        const durationMinutes =
          typeof booking.duration === 'string'
            ? parseInt(booking.duration, 10)
            : booking.duration || 0;
        const bookingEnd = new Date(
          bookingStart.getTime() + durationMinutes * 60000,
        );

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
        startTimeSlot: this.formatTime(slot.startTimeSlot),
        endTimeSlot: this.formatTime(slot.endTimeSlot),
        count: slot.bookings.length,
        bookingIds: slot.bookings.map((id) => id.toString()),
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
        .select("DATE_TRUNC('hour', items.scheduledDate)", 'startTimeSlot')
        .addSelect('items.duration', 'duration')
        .addSelect('COUNT(DISTINCT booking.id)', 'count')
        .groupBy("DATE_TRUNC('hour', items.scheduledDate)")
        .addGroupBy('items.duration');
    } else {
      query = query
        .select('DATE(items.scheduledDate)', 'startTimeSlot')
        .addSelect('items.duration', 'duration')
        .addSelect('COUNT(DISTINCT booking.id)', 'count')
        .groupBy('DATE(items.scheduledDate)')
        .addGroupBy('items.duration');
    }

    query = query.orderBy(
      groupBy === 'hour'
        ? "DATE_TRUNC('hour', items.scheduledDate)"
        : 'DATE(items.scheduledDate)',
      'ASC',
    );

    const results = await query.getRawMany();

    // Transform results to include calculated end times based on duration
    const transformedResults = results.map((r) => {
      const startDateTime = new Date(r.startTimeSlot);
      const durationMinutes =
        typeof r.duration === 'string'
          ? parseInt(r.duration, 10)
          : r.duration || 0;
      const endDateTime = new Date(
        startDateTime.getTime() + durationMinutes * 60000,
      );

      return {
        startTimeSlot: this.formatTime(startDateTime),
        endTimeSlot: this.formatTime(endDateTime),
        count: parseInt(r.count, 10),
        bookingIds: r.bookingIds,
      };
    });

    // For package type with hour grouping, consolidate results to use the actual time window
    if (
      filters.serviceType === 'packages' &&
      groupBy === 'hour' &&
      packageBookingData
    ) {
      const totalCount = transformedResults.reduce(
        (sum, r) => sum + r.count,
        0,
      );
      transformedResults.length = 0; // Clear array
      transformedResults.push({
        startTimeSlot: this.formatTime(packageBookingData.startTime),
        endTimeSlot: this.formatTime(packageBookingData.endTime),
        count: totalCount,
        bookingIds: [], // Optionally, you could aggregate booking IDs here as well
      });
    }

    return {
      serviceId,
      groupBy,
      total: transformedResults.reduce((sum, r) => sum + r.count, 0),
      data: transformedResults,
    };
  }

  async getSubServices(branchId: string) {
    return await this.subServiceRepo.find({
      where: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
        service: {
          deletedAt: null,
          status: EntityStatus.ACTIVE,
          branch: { id: branchId },
        },
      },
      relations: ['service', 'translations'],
    });
  }
}
