import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, EntityManager } from 'typeorm';
import { Package } from 'src/entities/packages.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { SubServiceTranslation } from 'src/entities/sub_service_translations.entity';
import { Service } from 'src/entities/services.entity';
import { PackageTranslation } from 'src/entities/package_translation.entity';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import { PaginationParams } from 'src/shared/pagination.types';
import {
  CreatePackageDto,
  UpdatePackageDto,
  CreateNewSubServiceDto,
} from './packages.types';
import { PriceOverride } from 'src/entities/price_overides.entity';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
    @InjectRepository(SubService)
    private subServiceRepo: Repository<SubService>,
    @InjectRepository(SubServiceTranslation)
    private subServiceTranslationRepo: Repository<SubServiceTranslation>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    @InjectRepository(PackageTranslation)
    private packageTranslationRepo: Repository<PackageTranslation>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
    private dataSource: DataSource,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('PackagesService');
  }

  private async createNewSubServices(
    newSubServices: CreateNewSubServiceDto[],
    manager: EntityManager,
    branch?: Branch,
  ): Promise<SubService[]> {
    const createdSubServices: SubService[] = [];

    for (const newSubService of newSubServices) {
      // Verify service exists
      const serviceExist = await manager.findOne(Service, {
        where: {
          id: newSubService.serviceId,
        },
      });

      if (!serviceExist) {
        throw new BadRequestException(
          `Service with ID ${newSubService.serviceId} not found`,
        );
      }

      let service = await manager.findOne(Service, {
        where: {
          name: serviceExist.name,
          branch: branch ? { id: branch.id } : undefined,
        },
      });
      if (!service) {
        // If service doesn't exist in this branch, create it
        service = manager.create(Service, {
          name: serviceExist.name,
          description: serviceExist.description,
          branch: branch,
        });
        service = await manager.save(service);
      }

      // Create new sub-service
      const subService = new SubService();
      subService.service = service;
      subService.name = newSubService.name;
      subService.durationMinutes = newSubService.durationMinutes || null;
      subService.price = newSubService.price;
      subService.status = newSubService.status || EntityStatus.ACTIVE;
      subService.onlyPackage = true; // New sub-services created in packages are only available as part of package

      const savedSubService = await manager.save(subService);

      // Create translations if provided
      if (newSubService.translations && newSubService.translations.length > 0) {
        const translations = newSubService.translations.map((t) => {
          const translation = new SubServiceTranslation();
          translation.subService = savedSubService;
          translation.languageCode = t.languageCode;
          translation.name = t.name;
          translation.description = t.description || null;
          return translation;
        });
        await manager.save(translations);
      }

      createdSubServices.push(savedSubService);
    }

    return createdSubServices;
  }

  async create(dto: CreatePackageDto, actorId?: string, actorName?: string) {
    // Normalize branchId to array
    const branchIds = Array.isArray(dto.branchId)
      ? dto.branchId
      : [dto.branchId];

    this.logger.log('Creating package', {
      name: dto.name,
      branchIds,
      totalBranches: branchIds.length,
    });

    const createdPackages = [];

    for (const branchId of branchIds) {
      const result = await this.dataSource.transaction(
        async (manager: EntityManager) => {
          // Validate branch exists
          const branch = await manager.findOne(Branch, {
            where: { id: branchId },
          });
          if (!branch) {
            throw new NotFoundException(`Branch with ID ${branchId} not found`);
          }

          // Collect sub-services from both existing IDs and new sub-services
          const allSubServices: SubService[] = [];

          // Handle existing sub-services
          if (dto.subServiceIds && dto.subServiceIds.length > 0) {
            const existingSubServices = await manager.find(SubService, {
              where: {
                id: In(dto.subServiceIds),
                status: EntityStatus.ACTIVE,
              },
              relations: ['service', 'service.branch'],
            });

            if (existingSubServices.length < dto.subServiceIds.length) {
              const foundIds = new Set(existingSubServices.map((s) => s.id));
              const missingIds = dto.subServiceIds.filter(
                (id) => !foundIds.has(id),
              );
              throw new BadRequestException(
                `Some sub-services are inactive or not found: ${missingIds.join(', ')}`,
              );
            }
            const subserviceNames = existingSubServices.map((s) => s.name);
            const serviceNames = existingSubServices.map((s) => s.service.name);
            // find sub-service in this branch
            const subServicesInBranch = await manager.find(SubService, {
              where: {
                name: In(subserviceNames),
                service: {
                  branch: { id: branchId },
                  name: In(serviceNames),
                },
              },
            });

            allSubServices.push(...subServicesInBranch);
          }

          // Handle new sub-services
          if (dto.newSubServices && dto.newSubServices.length > 0) {
            const newSubServices = await this.createNewSubServices(
              dto.newSubServices,
              manager,
              branch,
            );
            allSubServices.push(...newSubServices);
          }

          // Validate that we have at least 1 sub-service total
          if (allSubServices.length === 0) {
            throw new BadRequestException(
              'Package must have at least 1 sub-service',
            );
          }

          // Validate max 10 sub-services
          if (allSubServices.length > 10) {
            throw new BadRequestException(
              'Package can have at most 10 sub-services',
            );
          }

          // Create package
          const pkg = new Package();
          pkg.branch = branch;
          pkg.name = dto.name;
          pkg.price = dto.price;
          pkg.startDate = new Date(dto.startDate);
          pkg.endDate = new Date(dto.endDate);
          pkg.subServices = allSubServices;
          if (branchId === dto.mainBranchId) {
            pkg.status = dto.status;
          } else {
            pkg.status = EntityStatus.INACTIVE; // Set to inactive for non-main branches
          }

          const savedPackage = await manager.save(pkg);

          // Handle media associations
          if (dto.mediaIds && dto.mediaIds.length > 0) {
            const mediaList = await manager.find(Media, {
              where: { id: In(dto.mediaIds) },
            });

            for (const media of mediaList) {
              media.package = savedPackage;
              await manager.save(media);
            }
          }

          // Create translations
          if (dto.translations && dto.translations.length > 0) {
            const translations = dto.translations.map((t) => {
              const translation = new PackageTranslation();
              translation.package = savedPackage;
              translation.languageCode = t.languageCode;
              translation.name = t.name;
              translation.description = t.description;
              return translation;
            });
            await manager.save(translations);
          }

          return manager.findOne(Package, {
            where: { id: savedPackage.id },
            relations: ['subServices', 'translations', 'media', 'branch'],
          });
        },
      );

      // Log the action
      await this.actionLogService.logAction({
        feature: 'package',
        subFeature: null,
        actionType: 'create',
        actorId,
        actorName,
        entityType: 'package',
        entityId: result.id,
        newData: {
          name: result.name,
          price: result.price,
          startDate: result.startDate,
          endDate: result.endDate,
          status: result.status,
          subServicesCount: result.subServices?.length || 0,
        },
        description: `Created package: ${result.name}`,
        status: 'success',
        branchId: result.branch?.id || null,
      });

      createdPackages.push(result);
    }

    this.logger.log('Package creation completed', {
      name: dto.name,
      totalPackagesCreated: createdPackages.length,
    });

    // Return the first created package
    return createdPackages[0];
  }

  async findAll(
    branchId?: string,
    filters?: {
      search?: string;
      status?: EntityStatus;
      onlyAvailable?: boolean;
    },
    paginationParams?: PaginationParams,
  ) {
    const query = this.packageRepo
      .createQueryBuilder('pkg')
      .leftJoinAndSelect('pkg.subServices', 'subServices')
      .leftJoinAndSelect('subServices.service', 'service')
      .leftJoinAndSelect('pkg.translations', 'translations')
      .leftJoinAndSelect('pkg.media', 'media')
      .leftJoinAndSelect('pkg.branch', 'branch');

    if (branchId && branchId !== 'undefined') {
      query.where('pkg.branchId = :branchId', { branchId });
    }
    if (filters?.onlyAvailable) {
      const today = new Date();
      query.andWhere('pkg.startDate <= :today AND pkg.endDate >= :today', {
        today,
      });
    }

    query.addOrderBy('media.createdAt', 'ASC');

    if (filters?.search) {
      query.andWhere('pkg.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters?.status) {
      query.andWhere('pkg.status = :status', { status: filters.status });
    }

    query.orderBy('pkg.createdAt', 'DESC');

    if (paginationParams) {
      const paginationQuery = getPaginationQueryTypeORM(paginationParams);
      const [data, total] = await query
        .skip(paginationQuery.skip)
        .take(paginationQuery.take)
        .getManyAndCount();

      const totalCount = await query.getCount();

      return paginate(paginationParams || {}, totalCount, data);
    } else {
      return query.getMany();
    }
  }

  async findOne(id: string) {
    const pkg = await this.packageRepo
      .createQueryBuilder('pkg')
      .leftJoinAndSelect('pkg.subServices', 'subServices')
      .leftJoinAndSelect('subServices.service', 'service')
      .leftJoinAndSelect('pkg.translations', 'translations')
      .leftJoinAndSelect('pkg.media', 'media')
      .leftJoinAndSelect('pkg.branch', 'branch')
      .leftJoinAndSelect('branch.operatingHours', 'operatingHours')
      .where('pkg.id = :id', { id })
      .orderBy('media.createdAt', 'ASC')
      .getOne();

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return pkg;
  }

  async update(
    id: string,
    dto: UpdatePackageDto,
    actorId?: string,
    actorName?: string,
  ) {
    // Fetch current package data before transaction for audit trail
    const currentPkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['subServices'],
    });

    if (!currentPkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    const oldPackage = {
      name: currentPkg.name,
      price: currentPkg.price,
      startDate: currentPkg.startDate,
      endDate: currentPkg.endDate,
      status: currentPkg.status,
      subServicesCount: currentPkg.subServices?.length || 0,
    };

    const result = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const pkg = await manager.findOne(Package, {
          where: { id },
          relations: ['subServices', 'translations', 'media'],
        });

        if (!pkg) {
          throw new NotFoundException(`Package with ID ${id} not found`);
        }

        // Update basic fields
        if (dto.name !== undefined) pkg.name = dto.name;
        if (dto.price !== undefined) {
          pkg.price = dto.price;
          if (dto.isOverride !== undefined && dto.isOverride === true) {
            // soft delete existing price overrides for this sub-service
            await manager.softDelete(PriceOverride, {
              package: { id: pkg.id },
            });
          }
        }
        if (dto.startDate !== undefined)
          pkg.startDate = new Date(dto.startDate);
        if (dto.endDate !== undefined) pkg.endDate = new Date(dto.endDate);
        if (dto.status !== undefined) pkg.status = dto.status;

        // Update sub-services if provided
        if (
          (dto.subServiceIds !== undefined && dto.subServiceIds.length > 0) ||
          (dto.newSubServices !== undefined && dto.newSubServices.length > 0)
        ) {
          const allSubServices: SubService[] = [];

          // Handle existing sub-services
          if (dto.subServiceIds && dto.subServiceIds.length > 0) {
            const existingSubServices = await manager.find(SubService, {
              where: {
                id: In(dto.subServiceIds),
                status: EntityStatus.ACTIVE,
              },
            });

            if (existingSubServices.length < dto.subServiceIds.length) {
              const foundIds = new Set(existingSubServices.map((s) => s.id));
              const missingIds = dto.subServiceIds.filter(
                (id) => !foundIds.has(id),
              );
              throw new BadRequestException(
                `Some sub-services are inactive or not found: ${missingIds.join(', ')}`,
              );
            }

            allSubServices.push(...existingSubServices);
          }

          // Handle new sub-services
          if (dto.newSubServices && dto.newSubServices.length > 0) {
            const newSubServices = await this.createNewSubServices(
              dto.newSubServices,
              manager,
            );
            allSubServices.push(...newSubServices);
          }

          // Validate that we have at least 1 sub-service total
          if (allSubServices.length === 0) {
            throw new BadRequestException(
              'Package must have at least 1 sub-service',
            );
          }

          // Validate max 10 sub-services
          if (allSubServices.length > 10) {
            throw new BadRequestException(
              'Package can have at most 10 sub-services',
            );
          }

          pkg.subServices = allSubServices;
        }

        const updatedPackage = await manager.save(pkg);

        // Update media if provided
        if (dto.mediaIds !== undefined) {
          // Remove old media associations
          for (const media of pkg.media) {
            media.package = null;
            await manager.save(media);
          }

          // Add new media associations
          if (dto.mediaIds.length > 0) {
            const mediaList = await manager.find(Media, {
              where: { id: In(dto.mediaIds) },
            });

            for (const media of mediaList) {
              media.package = updatedPackage;
              await manager.save(media);
            }
          }
        }

        // Update translations if provided
        if (dto.translations !== undefined) {
          // Remove old translations
          await manager.delete(PackageTranslation, { package: updatedPackage });

          // Add new translations
          if (dto.translations.length > 0) {
            const translations = dto.translations.map((t) => {
              const translation = new PackageTranslation();
              translation.package = updatedPackage;
              translation.languageCode = t.languageCode;
              translation.name = t.name;
              translation.description = t.description;
              return translation;
            });
            await manager.save(translations);
          }
        }

        return manager.findOne(Package, {
          where: { id: updatedPackage.id },
          relations: ['subServices', 'translations', 'media', 'branch'],
        });
      },
    );

    // Log the action
    await this.actionLogService.logAction({
      feature: 'package',
      subFeature: null,
      actionType: 'update',
      actorId,
      actorName,
      entityType: 'package',
      entityId: id,
      oldData: oldPackage,
      newData: {
        name: result.name,
        price: result.price,
        startDate: result.startDate,
        endDate: result.endDate,
        status: result.status,
        subServicesCount: result.subServices?.length || 0,
      },
      description: `Updated package: ${result.name}`,
      status: 'success',
      branchId: result.branch?.id || null,
    });

    return result;
  }

  async delete(id: string, actorId?: string, actorName?: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['branch'],
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    // Log the action before deletion
    await this.actionLogService.logAction({
      feature: 'package',
      subFeature: null,
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'package',
      entityId: id,
      oldData: {
        name: pkg.name,
        price: pkg.price,
        startDate: pkg.startDate,
        endDate: pkg.endDate,
        status: pkg.status,
      },
      description: `Deleted package: ${pkg.name}`,
      status: 'success',
      branchId: pkg.branch?.id || null,
    });

    await this.packageRepo.softRemove(pkg);
    return { id, message: 'Package deleted successfully' };
  }

  async getActiveSubServices(packageId: string) {
    const pkg = await this.packageRepo.findOne({
      where: { id: packageId },
      relations: ['subServices'],
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    // Filter only active sub-services
    return pkg.subServices.filter(
      (subService) => subService.status === EntityStatus.ACTIVE,
    );
  }
}
