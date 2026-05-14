import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { PriceOverride } from 'src/entities/price_overides.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import {
  PaginationParams,
  PaginatedResponse,
} from 'src/shared/pagination.types';
import {
  CreatePriceOverrideDto,
  UpdatePriceOverrideDto,
} from './price-overrides.types';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';

@Injectable()
export class PriceOverridesService {
  constructor(
    @InjectRepository(PriceOverride)
    private readonly priceOverrideRepo: Repository<PriceOverride>,
    @InjectRepository(SubService)
    private readonly subServiceRepo: Repository<SubService>,
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(Programme)
    private readonly programmeRepo: Repository<Programme>,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('PriceOverridesService');
  }

  async create(
    dto: CreatePriceOverrideDto,
    actorId?: string,
    actorName?: string,
  ): Promise<PriceOverride> {
    this.logger.log('Creating price override', {
      startDate: dto.overrideStartDate,
    });
    const priceOverride = new PriceOverride();

    const startDate = new Date(dto.overrideStartDate);

    priceOverride.overrideStartDate = startDate;

    const endDate = new Date(dto.overrideEndDate);
    priceOverride.overrideEndDate = endDate;

    priceOverride.price = dto.price;
    let branchId = null;

    if (dto.subServiceId) {
      const subService = await this.subServiceRepo.findOne({
        where: { id: dto.subServiceId },
        relations: ['service', 'service.branch'],
      });
      if (!subService) {
        this.logger.error('SubService not found', null, {
          subServiceId: dto.subServiceId,
        });
        throw new NotFoundException(
          `SubService with ID ${dto.subServiceId} not found`,
        );
      }
      priceOverride.subService = subService;
      branchId = subService.service?.branch?.id || null;
      // Check for overlapping date ranges with the same subService
      const overlappingSubServices = await this.priceOverrideRepo.find({
        where: {
          subService: { id: dto.subServiceId },
        },
      });
      if (overlappingSubServices && overlappingSubServices.length > 0) {
        for (const existing of overlappingSubServices) {
          const existingStart = new Date(existing.overrideStartDate);
          const existingEnd = new Date(existing.overrideEndDate);
          if (startDate <= existingEnd && endDate >= existingStart) {
            throw new BadRequestException(
              `Price override with overlapping date range already exists for this Service`,
            );
          }
        }
      }
    }

    if (dto.packageId) {
      const pkg = await this.packageRepo.findOne({
        where: { id: dto.packageId },
        relations: ['branch'],
      });
      if (!pkg) {
        throw new NotFoundException(
          `Package with ID ${dto.packageId} not found`,
        );
      }
      priceOverride.package = pkg;
      branchId = pkg.branch.id || null;
      // Check for overlapping date ranges with the same package
      const overlappingPackages = await this.priceOverrideRepo.find({
        where: {
          package: { id: dto.packageId },
        },
      });
      if (overlappingPackages && overlappingPackages.length > 0) {
        for (const existing of overlappingPackages) {
          const existingStart = new Date(existing.overrideStartDate);
          const existingEnd = new Date(existing.overrideEndDate);
          if (startDate <= existingEnd && endDate >= existingStart) {
            throw new BadRequestException(
              `Price override with overlapping date range already exists for this Package`,
            );
          }
        }
      }
    }

    if (dto.programmeId) {
      const programme = await this.programmeRepo.findOne({
        where: { id: dto.programmeId },
        relations: ['branch'],
      });
      if (!programme) {
        throw new NotFoundException(
          `Programme with ID ${dto.programmeId} not found`,
        );
      }
      priceOverride.programme = programme;
      branchId = programme.branch.id || null;
      // Check for overlapping date ranges with the same programme
      const overlappingProgrammes = await this.priceOverrideRepo.find({
        where: {
          programme: { id: dto.programmeId },
        },
      });
      if (overlappingProgrammes && overlappingProgrammes.length > 0) {
        for (const existing of overlappingProgrammes) {
          const existingStart = new Date(existing.overrideStartDate);
          const existingEnd = new Date(existing.overrideEndDate);
          if (startDate <= existingEnd && endDate >= existingStart) {
            throw new BadRequestException(
              `Price override with overlapping date range already exists for this Programme`,
            );
          }
        }
      }
    }

    const savedPriceOverride = await this.priceOverrideRepo.save(priceOverride);

    // Log the action
    await this.actionLogService.logAction({
      feature: 'daily',
      subFeature: 'price',
      actionType: 'create',
      actorId,
      actorName,
      entityType: 'price_override',
      entityId: savedPriceOverride.id,
      newData: {
        price: savedPriceOverride.price,
        overrideStartDate: savedPriceOverride.overrideStartDate,
        overrideEndDate: savedPriceOverride.overrideEndDate,
        subServiceId: savedPriceOverride.subService?.id || null,
        packageId: savedPriceOverride.package?.id || null,
        programmeId: savedPriceOverride.programme?.id || null,
      },
      description: `Created price override: ${savedPriceOverride.price}`,
      status: 'success',
      branchId,
    });

    return savedPriceOverride;
  }

  async findAll(filters?: {
    startDate?: string;
    endDate?: string;
    search?: string;
    branchId?: string;
  }): Promise<PriceOverride[] | PaginatedResponse<PriceOverride>> {
    const query = this.priceOverrideRepo
      .createQueryBuilder('priceOverride')
      .leftJoinAndSelect('priceOverride.subService', 'subService')
      .leftJoinAndSelect('priceOverride.package', 'package')
      .leftJoinAndSelect('priceOverride.programme', 'programme')
      .leftJoinAndSelect('subService.service', 'subServiceService');

    if (filters?.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            '(subService.id IS NOT NULL AND subService.name ILIKE :search) OR ' +
              '(package.id IS NOT NULL AND package.name ILIKE :search) OR ' +
              '(programme.id IS NOT NULL AND programme.name ILIKE :search)',
            { search: `%${filters.search}%` },
          );
        }),
      );
    }

    if (filters?.branchId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            'subServiceService.branchId = :branchId OR package.branchId = :branchId OR programme.branchId = :branchId',
            { branchId: filters.branchId },
          );
        }),
      );
    }
    if (filters?.startDate && filters?.endDate) {
      // Use ISO datetime values directly for accurate comparison
      query.andWhere(
        'priceOverride.overrideStartDate <= :endDate AND priceOverride.overrideEndDate >= :startDate',
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      );
    }

    const priceOverrides = await query
      .orderBy('priceOverride.overrideStartDate', 'DESC')
      .getMany();

    return priceOverrides;
  }
  async findByDate(
    startDate: string,
    endDate: string,
    branchId?: string,
  ): Promise<PriceOverride[] | PaginatedResponse<PriceOverride>> {
    const query = this.priceOverrideRepo
      .createQueryBuilder('priceOverride')
      .leftJoinAndSelect('priceOverride.subService', 'subService')
      .leftJoinAndSelect('priceOverride.package', 'package')
      .leftJoinAndSelect('priceOverride.programme', 'programme')
      .leftJoinAndSelect('subService.service', 'subServiceService');

    if (branchId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            'subServiceService.branchId = :branchId OR package.branchId = :branchId OR programme.branchId = :branchId',
            { branchId: branchId },
          );
        }),
      );
    }
    if (startDate && endDate) {
      query.andWhere(
        'priceOverride.overrideStartDate <= :endDate AND priceOverride.overrideEndDate >= :startDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const priceOverrides = await query
      .orderBy('priceOverride.overrideStartDate', 'DESC')
      .getMany();

    return priceOverrides;
  }

  async findOne(id: string): Promise<PriceOverride> {
    const priceOverride = await this.priceOverrideRepo
      .createQueryBuilder('priceOverride')
      .leftJoinAndSelect('priceOverride.subService', 'subService')
      .leftJoinAndSelect('subService.service', 'subServiceService')
      .leftJoinAndSelect('subServiceService.branch', 'serviceBranch')
      .leftJoinAndSelect('priceOverride.package', 'package')
      .leftJoinAndSelect('package.branch', 'packageBranch')
      .leftJoinAndSelect('priceOverride.programme', 'programme')
      .leftJoinAndSelect('programme.branch', 'programmeBranch')
      .where('priceOverride.id = :id', { id })
      .getOne();

    if (!priceOverride) {
      throw new NotFoundException('Price override not found');
    }
    return priceOverride;
  }

  async findBySubService(
    subServiceId: string,
    paginationParams?: PaginationParams,
  ): Promise<PriceOverride[] | PaginatedResponse<PriceOverride>> {
    const query = this.priceOverrideRepo
      .createQueryBuilder('priceOverride')
      .leftJoinAndSelect('priceOverride.subService', 'subService')
      .leftJoinAndSelect('priceOverride.package', 'package')
      .leftJoinAndSelect('priceOverride.programme', 'programme')
      .where('priceOverride.subServiceId = :subServiceId', { subServiceId });

    if (!paginationParams) {
      return query.orderBy('priceOverride.overrideDate', 'DESC').getMany();
    }

    const { skip, take } = getPaginationQueryTypeORM(paginationParams);

    const [results, total] = await query
      .orderBy('priceOverride.overrideDate', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const totalCount = await query.getCount();

    return paginate(paginationParams, totalCount, results);
  }

  async update(
    id: string,
    dto: UpdatePriceOverrideDto,
    actorId?: string,
    actorName?: string,
  ): Promise<PriceOverride> {
    const priceOverride = await this.findOne(id);

    // Store old data for audit trail
    const oldPriceOverride = {
      price: priceOverride.price,
      overrideStartDate: priceOverride.overrideStartDate,
      overrideEndDate: priceOverride.overrideEndDate,
      subServiceId: priceOverride.subService?.id || null,
      packageId: priceOverride.package?.id || null,
      programmeId: priceOverride.programme?.id || null,
    };

    let startDate = priceOverride.overrideStartDate;
    let endDate = priceOverride.overrideEndDate;

    if (dto.overrideStartDate) {
      startDate = new Date(dto.overrideStartDate);
      priceOverride.overrideStartDate = startDate;
    }

    if (dto.overrideEndDate) {
      endDate = new Date(dto.overrideEndDate);
      priceOverride.overrideEndDate = endDate;
    }

    if (dto.price !== undefined) {
      priceOverride.price = dto.price;
    }
    // Check overlap for subService (either existing or new)
    const subServiceIdToCheck =
      dto?.subServiceId || priceOverride?.subService?.id;
    if (subServiceIdToCheck) {
      if (dto.subServiceId) {
        const subService = await this.subServiceRepo.findOne({
          where: { id: dto.subServiceId },
          relations: ['service', 'service.branch'],
        });
        if (!subService) {
          throw new NotFoundException(
            `SubService with ID ${dto.subServiceId} not found`,
          );
        }
        priceOverride.subService = subService;
      }

      const overlappingSubServices = await this.priceOverrideRepo.find({
        where: {
          subService: { id: subServiceIdToCheck },
        },
      });
      if (overlappingSubServices && overlappingSubServices.length > 0) {
        for (const existing of overlappingSubServices) {
          if (existing.id !== id) {
            const existingStart = new Date(existing.overrideStartDate);
            const existingEnd = new Date(existing.overrideEndDate);
            if (startDate <= existingEnd && endDate >= existingStart) {
              throw new BadRequestException(
                `Price override with overlapping date range already exists for this Service`,
              );
            }
          }
        }
      }
    }

    // Check overlap for package (either existing or new)
    const packageIdToCheck = dto?.packageId || priceOverride?.package?.id;
    if (packageIdToCheck) {
      if (dto.packageId) {
        const pkg = await this.packageRepo.findOne({
          where: { id: dto.packageId },
          relations: ['branch'],
        });
        if (!pkg) {
          throw new NotFoundException(
            `Package with ID ${dto.packageId} not found`,
          );
        }
        priceOverride.package = pkg;
      }

      const overlappingPackages = await this.priceOverrideRepo.find({
        where: {
          package: { id: packageIdToCheck },
        },
      });
      if (overlappingPackages && overlappingPackages.length > 0) {
        for (const existing of overlappingPackages) {
          if (existing.id !== id) {
            const existingStart = new Date(existing.overrideStartDate);
            const existingEnd = new Date(existing.overrideEndDate);
            if (startDate <= existingEnd && endDate >= existingStart) {
              throw new BadRequestException(
                `Price override with overlapping date range already exists for this Package`,
              );
            }
          }
        }
      }
    }

    // Check overlap for programme (either existing or new)
    const programmeIdToCheck = dto?.programmeId || priceOverride?.programme?.id;
    if (programmeIdToCheck) {
      if (dto.programmeId) {
        const programme = await this.programmeRepo.findOne({
          where: { id: dto.programmeId },
          relations: ['branch'],
        });
        if (!programme) {
          throw new NotFoundException(
            `Programme with ID ${dto.programmeId} not found`,
          );
        }
        priceOverride.programme = programme;
      }

      const overlappingProgrammes = await this.priceOverrideRepo.find({
        where: {
          programme: { id: programmeIdToCheck },
        },
      });
      if (overlappingProgrammes && overlappingProgrammes.length > 0) {
        for (const existing of overlappingProgrammes) {
          if (existing.id !== id) {
            const existingStart = new Date(existing.overrideStartDate);
            const existingEnd = new Date(existing.overrideEndDate);
            if (startDate <= existingEnd && endDate >= existingStart) {
              throw new BadRequestException(
                `Price override with overlapping date range already exists for this Programme`,
              );
            }
          }
        }
      }
    }

    const updatedPriceOverride =
      await this.priceOverrideRepo.save(priceOverride);

    // Log the action
    await this.actionLogService.logAction({
      feature: 'daily',
      subFeature: 'price',
      actionType: 'update',
      actorId,
      actorName,
      entityType: 'price_override',
      entityId: id,
      oldData: oldPriceOverride,
      newData: {
        price: updatedPriceOverride.price,
        overrideStartDate: updatedPriceOverride.overrideStartDate,
        overrideEndDate: updatedPriceOverride.overrideEndDate,
        subServiceId: updatedPriceOverride.subService?.id || null,
        packageId: updatedPriceOverride.package?.id || null,
        programmeId: updatedPriceOverride.programme?.id || null,
      },
      description: `Updated price override: ${updatedPriceOverride.price}`,
      status: 'success',
      branchId:
        priceOverride.subService?.service?.branch?.id ||
        priceOverride.package?.branch?.id ||
        priceOverride.programme?.branch?.id ||
        null,
    });

    return updatedPriceOverride;
  }

  async remove(
    id: string,
    actorId?: string,
    actorName?: string,
  ): Promise<void> {
    const priceOverride = await this.findOne(id);
    if (!priceOverride) {
      throw new NotFoundException('Price override not found');
    }
    // Log the action before deletion
    await this.actionLogService.logAction({
      feature: 'daily',
      subFeature: 'price',
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'price_override',
      entityId: id,
      oldData: {
        price: priceOverride.price,
        overrideStartDate: priceOverride.overrideStartDate,
        overrideEndDate: priceOverride.overrideEndDate,
        subServiceId: priceOverride.subService?.id || null,
        packageId: priceOverride.package?.id || null,
        programmeId: priceOverride.programme?.id || null,
      },
      description: `Deleted price override: ${priceOverride.price}`,
      status: 'success',
      branchId:
        priceOverride.subService?.service?.branch?.id ||
        priceOverride.package?.branch?.id ||
        priceOverride.programme?.branch?.id ||
        null,
    });

    await this.priceOverrideRepo.softDelete(id);
  }
}
