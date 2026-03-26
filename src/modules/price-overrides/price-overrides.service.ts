import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Set start date with custom hours or default (00:00:00) - Use local timezone
    const startDate = new Date(dto.overrideStartDate);
    startDate.setUTCHours(0, 0, 0, 0);
    priceOverride.overrideStartDate = startDate;

    // Set end date with custom hours or default (23:59:59) - Use local timezone
    const endDate = new Date(dto.overrideEndDate);
    endDate.setUTCHours(23, 59, 59, 999);
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

    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(filters.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      query.andWhere(
        'priceOverride.overrideStartDate >= :startDate AND priceOverride.overrideEndDate <= :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

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
        'subServiceService.branchId = :branchId OR package.branchId = :branchId OR programme.branchId = :branchId',
        { branchId: filters.branchId },
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

    if (dto.overrideStartDate) {
      const startDate = new Date(dto.overrideStartDate);
      startDate.setUTCHours(0, 0, 0, 0);
      priceOverride.overrideStartDate = startDate;
    }

    if (dto.overrideEndDate) {
      const endDate = new Date(dto.overrideEndDate);
      endDate.setUTCHours(23, 59, 59, 999);
      priceOverride.overrideEndDate = endDate;
    }

    if (dto.price !== undefined) {
      priceOverride.price = dto.price;
    }

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

    return this.priceOverrideRepo.save(priceOverride);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.priceOverrideRepo.softDelete(id);
  }
}
