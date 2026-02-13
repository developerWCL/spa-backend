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
import { CreateServiceDto, UpdateServiceDto } from './services.types';

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

  async findAll(branchId: string) {
    return this.serviceRepo.find({
      where: { branch: { id: branchId }, deletedAt: null },
      relations: ['category', 'subServices', 'translations', 'media'],
      order: { createdAt: 'DESC' },
    });
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
      ],
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
      order: { displayOrder: 'ASC' },
    });
  }
}
