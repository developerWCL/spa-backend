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
  ) {}

  async create(dto: CreatePriceOverrideDto): Promise<PriceOverride> {
    const priceOverride = new PriceOverride();

    const startDate = new Date(dto.overrideStartDate);

    priceOverride.overrideStartDate = startDate;

    const endDate = new Date(dto.overrideEndDate);
    priceOverride.overrideEndDate = endDate;

    priceOverride.price = dto.price;

    if (dto.subServiceId) {
      const subService = await this.subServiceRepo.findOne({
        where: { id: dto.subServiceId },
      });
      if (!subService) {
        throw new NotFoundException(
          `SubService with ID ${dto.subServiceId} not found`,
        );
      }
      priceOverride.subService = subService;

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
      });
      if (!pkg) {
        throw new NotFoundException(
          `Package with ID ${dto.packageId} not found`,
        );
      }
      priceOverride.package = pkg;

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
      });
      if (!programme) {
        throw new NotFoundException(
          `Programme with ID ${dto.programmeId} not found`,
        );
      }
      priceOverride.programme = programme;

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

    return this.priceOverrideRepo.save(priceOverride);
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
      .leftJoinAndSelect('priceOverride.package', 'package')
      .leftJoinAndSelect('priceOverride.programme', 'programme')
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

    const [results, totalCount] = await query
      .orderBy('priceOverride.overrideDate', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginate(paginationParams, totalCount, results);
  }

  async update(
    id: string,
    dto: UpdatePriceOverrideDto,
  ): Promise<PriceOverride> {
    const priceOverride = await this.findOne(id);

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

    return this.priceOverrideRepo.save(priceOverride);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.priceOverrideRepo.softDelete(id);
  }
}
