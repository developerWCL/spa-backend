import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Raw, Repository } from 'typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { Media } from '../../entities/media.entity';
import { PromotionService as PromotionServiceEntity } from '../../entities/promotion_services.entity';
import { PromotionPackage } from '../../entities/promotion_packages.entity';
import { PromotionProgramme } from '../../entities/promotion_programmes.entity';
import { Service } from '../../entities/services.entity';
import { Package } from '../../entities/packages.entity';
import { Programme } from '../../entities/programmes.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './promotion.dto';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import { paginate } from 'src/shared/pagination.util';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(PromotionServiceEntity)
    private readonly promotionServiceRepository: Repository<PromotionServiceEntity>,
    @InjectRepository(PromotionPackage)
    private readonly promotionPackageRepository: Repository<PromotionPackage>,
    @InjectRepository(PromotionProgramme)
    private readonly promotionProgrammeRepository: Repository<PromotionProgramme>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Programme)
    private readonly programmeRepository: Repository<Programme>,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('PromotionService');
  }

  async create(
    dto: CreatePromotionDto,
    actorId?: string,
    actorName?: string,
  ): Promise<Promotion> {
    this.logger.log('Creating promotion', { name: dto.name, code: dto.code });
    const {
      mediaIds = [],
      serviceIds = [],
      packageIds = [],
      programmeIds = [],
      ...dtoWithoutIds
    } = dto;
    const promotion = this.promotionRepository.create({
      ...dtoWithoutIds,
      autoApply: true,
    });
    if (dto.branchId) {
      promotion.branch = await this.branchRepository.findOne({
        where: { id: dto.branchId },
      });
    }
    const savedPromotion = await this.promotionRepository.save(promotion);

    // Link media to promotion if mediaIds are provided
    if (mediaIds.length > 0) {
      await this.mediaRepository.update(
        { id: In(mediaIds) },
        { promotion: savedPromotion },
      );
    }

    // Link services to promotion if serviceIds are provided
    if (serviceIds.length > 0) {
      const services = await this.serviceRepository.find({
        where: { id: In(serviceIds) },
      });
      const promotionServices = services.map((service) =>
        this.promotionServiceRepository.create({
          promotion: savedPromotion,
          service,
        }),
      );
      await this.promotionServiceRepository.save(promotionServices);
    }

    // Link packages to promotion if packageIds are provided
    if (packageIds.length > 0) {
      const packages = await this.packageRepository.find({
        where: { id: In(packageIds) },
      });
      const promotionPackages = packages.map((pkg) =>
        this.promotionPackageRepository.create({
          promotion: savedPromotion,
          package: pkg,
        }),
      );
      await this.promotionPackageRepository.save(promotionPackages);
    }

    // Link programmes to promotion if programmeIds are provided
    if (programmeIds.length > 0) {
      const programmes = await this.programmeRepository.find({
        where: { id: In(programmeIds) },
      });
      const promotionProgrammes = programmes.map((programme) =>
        this.promotionProgrammeRepository.create({
          promotion: savedPromotion,
          programme,
        }),
      );
      await this.promotionProgrammeRepository.save(promotionProgrammes);
    }

    // Log the action (before fetching full relations to avoid memory issues)
    await this.actionLogService.logAction({
      feature: 'promotion',
      subFeature: null,
      actionType: 'create',
      actorId,
      actorName,
      entityType: 'promotion',
      entityId: savedPromotion.id,
      newData: {
        name: savedPromotion.name,
        code: savedPromotion.code,
        discountType: savedPromotion.discountType,
        discountValue: savedPromotion.discountValue,
        status: savedPromotion.status,
      },
      description: `Created promotion: ${savedPromotion.name}`,
      status: 'success',
      branchId: savedPromotion.branch?.id || null,
    });

    // Return minimal promotion to avoid memory exhaustion from loading all relations
    return await this.findOneMinimal(savedPromotion.id);
  }

  async findAll(
    spaId?: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    branchId?: string,
    serviceIds?: string,
  ): Promise<PaginatedResponse<Promotion>> {
    // Sanitize string 'undefined' values to actual undefined
    spaId = spaId === 'undefined' ? undefined : spaId;
    search = search === 'undefined' ? undefined : search;
    status = status === 'undefined' ? undefined : status;
    branchId = branchId === 'undefined' ? undefined : branchId;

    // Sanitize and normalize serviceIds - handle string or array inputs
    let normalizedServiceIds: string[] = [];
    if (serviceIds) {
      normalizedServiceIds = serviceIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }

    // Set default pagination to prevent loading massive datasets
    const defaultPage = page || 1;
    const defaultLimit = limit || 50;

    if (branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
        relations: ['spa'],
      });
      if (!branch) throw new NotFoundException('Branch not found');
    }

    // Build query using QueryBuilder
    let query = this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.branch', 'branch')
      .leftJoinAndSelect('branch.spa', 'spa')
      .leftJoinAndSelect('promotion.media', 'media')
      .leftJoinAndSelect('promotion.services', 'ps')
      .leftJoinAndSelect('ps.service', 'service')
      .leftJoinAndSelect('promotion.packages', 'pp')
      .leftJoinAndSelect('pp.package', 'package')
      .leftJoinAndSelect('promotion.programmes', 'ppg')
      .leftJoinAndSelect('ppg.programme', 'programme');

    // Apply SPA filter
    if (spaId) {
      query = query.andWhere('spa.id = :spaId', { spaId });
    }

    // Apply Branch filter
    if (branchId) {
      query = query.andWhere('branch.id = :branchId', { branchId });
    }

    // Apply Status filter
    if (status) {
      query = query.andWhere('promotion.status = :status', {
        status: status as EntityStatus,
      });
    }

    // Apply Search filter (search in name or code - case insensitive)
    if (search) {
      const searchCondition = `%${search.toLowerCase()}%`;
      query = query.andWhere(
        '(LOWER(promotion.name) LIKE :search OR LOWER(promotion.code) LIKE :search)',
        { search: searchCondition },
      );
    }

    // Apply Service filter if provided
    if (normalizedServiceIds.length > 0) {
      query = query.andWhere(
        '(ps.service.id IN (:...serviceIds) OR pp.package.id IN (:...serviceIds) OR ppg.programme.id IN (:...serviceIds))',
        { serviceIds: normalizedServiceIds },
      );
    }

    // Add ordering and pagination
    query = query
      .orderBy('promotion.createdAt', 'DESC')
      .skip((defaultPage - 1) * defaultLimit)
      .take(defaultLimit);

    const [promotions, total] = await query.getManyAndCount();
    const promotionsWithLinks = promotions.map((promotion) => {
      return {
        ...promotion,
        link: `${process.env.BOOKING_ENGINE_URL}/${promotion.branch.spa.id}?branchId=${promotion.branch.id}&promotionId=${promotion.id}`,
      };
    });
    return paginate(
      { page: defaultPage, limit: defaultLimit },
      total,
      promotionsWithLinks,
    );
  }

  async findOne(id: string): Promise<Promotion> {
    // Load base promotion with limited relations to prevent memory exhaustion
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['branch', 'branch.spa', 'media'],
    });
    if (!promotion) throw new NotFoundException('Promotion not found');

    // Load junction relations separately with limits to avoid heap exhaustion
    const [services, packages, programmes] = await Promise.all([
      this.promotionServiceRepository.find({
        where: { promotion: { id } },
        relations: ['service'],
        take: 1000, // Limit to prevent massive loads
      }),
      this.promotionPackageRepository.find({
        where: { promotion: { id } },
        relations: ['package'],
        take: 1000,
      }),
      this.promotionProgrammeRepository.find({
        where: { promotion: { id } },
        relations: ['programme'],
        take: 1000,
      }),
    ]);

    // Attach loaded relations
    (promotion as any).services = services;
    (promotion as any).packages = packages;
    (promotion as any).programmes = programmes;

    return promotion;
  }

  // Lightweight version for internal use (create/update) - avoids loading large relation arrays
  async findOneMinimal(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['branch', 'branch.spa', 'media'],
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return promotion;
  }

  async update(
    id: string,
    dto: UpdatePromotionDto,
    actorId?: string,
    actorName?: string,
  ): Promise<Promotion> {
    const promotion = await this.findOneMinimal(id);

    // Store old data for audit trail
    const oldPromotion = {
      name: promotion.name,
      code: promotion.code,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      status: promotion.status,
    };

    if (dto.branchId) {
      promotion.branch = await this.branchRepository.findOne({
        where: { id: dto.branchId },
      });
    }

    // Remove IDs from the object assignment since they're not columns
    const {
      mediaIds = [],
      serviceIds,
      packageIds,
      programmeIds,
      ...dtoWithoutIds
    } = dto;
    Object.assign(promotion, dtoWithoutIds);
    const savedPromotion = await this.promotionRepository.save(promotion);

    // Handle media unlinking - unlink all media not in the new list
    if (mediaIds !== undefined) {
      // First, unlink old media (set promotion to null for media not in the new list)
      const oldMediaIds = promotion.media?.map((m) => m.id) || [];
      const mediaIdsToUnlink = oldMediaIds.filter(
        (id) => !mediaIds?.includes(id),
      );

      if (mediaIdsToUnlink.length > 0) {
        await this.mediaRepository.update(
          { id: In(mediaIdsToUnlink) },
          { promotion: null },
        );
      }

      // Then, link new media to this promotion
      if (mediaIds.length > 0) {
        await this.mediaRepository.update(
          { id: In(mediaIds) },
          { promotion: savedPromotion },
        );
      }
    }

    // Handle service relationships
    if (serviceIds !== undefined) {
      // Delete old service relationships using raw query to avoid memory issues with large batches
      await this.promotionServiceRepository
        .createQueryBuilder()
        .softDelete()
        .where('promotionId = :promotionId', { promotionId: id })
        .execute();

      // Create new service relationships
      if (serviceIds.length > 0) {
        const services = await this.serviceRepository.find({
          where: { id: In(serviceIds) },
        });
        const promotionServices = services.map((service) =>
          this.promotionServiceRepository.create({
            promotion: savedPromotion,
            service,
          }),
        );
        await this.promotionServiceRepository.save(promotionServices);
      }
    }

    // Handle package relationships
    if (packageIds !== undefined) {
      // Delete old package relationships using raw query to avoid memory issues with large batches
      await this.promotionPackageRepository
        .createQueryBuilder()
        .softDelete()
        .where('promotionId = :promotionId', { promotionId: id })
        .execute();

      // Create new package relationships
      if (packageIds.length > 0) {
        const packages = await this.packageRepository.find({
          where: { id: In(packageIds) },
        });
        const promotionPackages = packages.map((pkg) =>
          this.promotionPackageRepository.create({
            promotion: savedPromotion,
            package: pkg,
          }),
        );
        await this.promotionPackageRepository.save(promotionPackages);
      }
    }

    // Handle programme relationships
    if (programmeIds !== undefined) {
      // Delete old programme relationships using raw query to avoid memory issues with large batches
      await this.promotionProgrammeRepository
        .createQueryBuilder()
        .softDelete()
        .where('promotionId = :promotionId', { promotionId: id })
        .execute();
      // Create new programme relationships
      if (programmeIds.length > 0) {
        const programmes = await this.programmeRepository.find({
          where: { id: In(programmeIds) },
        });
        const promotionProgrammes = programmes.map((programme) =>
          this.promotionProgrammeRepository.create({
            promotion: savedPromotion,
            programme,
          }),
        );
        await this.promotionProgrammeRepository.save(promotionProgrammes);
      }
    }

    // Return minimal promotion to avoid memory exhaustion from loading all relations
    const result = await this.findOneMinimal(savedPromotion.id);

    // Log the action
    await this.actionLogService.logAction({
      feature: 'promotion',
      subFeature: null,
      actionType: 'update',
      actorId,
      actorName,
      entityType: 'promotion',
      entityId: id,
      oldData: oldPromotion,
      newData: {
        name: result.name,
        code: result.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        status: result.status,
      },
      description: `Updated promotion: ${result.name}`,
      status: 'success',
      branchId: result.branch?.id || null,
    });

    return result;
  }

  async remove(
    id: string,
    actorId?: string,
    actorName?: string,
  ): Promise<void> {
    // Use minimal query to avoid loading all relationships for deletion
    const promotion = await this.findOneMinimal(id);

    // Log the action before deletion
    await this.actionLogService.logAction({
      feature: 'promotion',
      subFeature: null,
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'promotion',
      entityId: id,
      oldData: {
        name: promotion.name,
        code: promotion.code,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        status: promotion.status,
      },
      description: `Deleted promotion: ${promotion.name}`,
      status: 'success',
      branchId: promotion.branch?.id || null,
    });

    // Soft delete junction records using raw queries to avoid memory issues with large batches
    await Promise.all([
      this.promotionServiceRepository
        .createQueryBuilder()
        .softDelete()
        .where('promotionId = :promotionId', { promotionId: id })
        .execute(),
      this.promotionPackageRepository
        .createQueryBuilder()
        .softDelete()
        .where('promotionId = :promotionId', { promotionId: id })
        .execute(),
      this.promotionProgrammeRepository
        .createQueryBuilder()
        .softDelete()
        .where('promotionId = :promotionId', { promotionId: id })
        .execute(),
    ]);

    // Then soft delete the promotion
    await this.promotionRepository.softRemove(promotion);
  }

  async findAutoApply(spaId: string, branch?: string): Promise<Promotion[]> {
    // Sanitize string 'undefined' values to actual undefined
    spaId = spaId === 'undefined' ? undefined : spaId;
    branch = branch === 'undefined' ? undefined : branch;

    if (!spaId) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let where: FindOptionsWhere<Promotion> | FindOptionsWhere<Promotion>[];

    if (branch) {
      where = {
        branch: {
          id: branch,
          spa: { id: spaId },
        },
        autoApply: true,
        status: EntityStatus.ACTIVE,
        startDate: branch
          ? Raw((alias) => `${alias} IS NULL OR ${alias} <= :today`, {
              today: today.toISOString().split('T')[0],
            })
          : undefined,
        endDate: branch
          ? Raw((alias) => `${alias} IS NULL OR ${alias} >= :today`, {
              today: today.toISOString().split('T')[0],
            })
          : undefined,
      };
    } else {
      where = {
        autoApply: true,
        status: EntityStatus.ACTIVE,
        startDate: Raw((alias) => `${alias} IS NULL OR ${alias} <= :today`, {
          today: today.toISOString().split('T')[0],
        }),
        endDate: Raw((alias) => `${alias} IS NULL OR ${alias} >= :today`, {
          today: today.toISOString().split('T')[0],
        }),
      };
    }

    const promotions = await this.promotionRepository.find({
      where,
      relations: ['branch', 'branch.spa', 'media'],
      order: { createdAt: 'DESC' },
    });

    // Filter by max used
    const activePromotions = promotions.filter(
      (p) => !p.maxUsed || p.used < p.maxUsed,
    );

    return activePromotions;
  }
}
