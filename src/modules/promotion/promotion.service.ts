import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Raw, Repository } from 'typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { Media } from '../../entities/media.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './promotion.dto';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import { paginate } from 'src/shared/pagination.util';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('PromotionService');
  }

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    this.logger.log('Creating promotion', { name: dto.name, code: dto.code });
    const { mediaIds, ...dtoWithoutMediaIds } = dto;
    const promotion = this.promotionRepository.create({
      ...dtoWithoutMediaIds,
      autoApply: true,
    });
    if (dto.branchId) {
      promotion.branch = await this.branchRepository.findOne({
        where: { id: dto.branchId },
      });
    }
    const savedPromotion = await this.promotionRepository.save(promotion);

    // Link media to promotion if mediaIds are provided
    if (mediaIds && mediaIds.length > 0) {
      await this.mediaRepository.update(
        { id: In(mediaIds) },
        { promotion: savedPromotion },
      );
    }

    // Return promotion with linked media
    return await this.promotionRepository.findOne({
      where: { id: savedPromotion.id },
      relations: ['branch', 'branch.spa', 'media'],
    });
  }

  async findAll(
    spaId?: string,
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
    branchId?: string,
  ): Promise<PaginatedResponse<Promotion>> {
    // Sanitize string 'undefined' values to actual undefined
    spaId = spaId === 'undefined' ? undefined : spaId;
    search = search === 'undefined' ? undefined : search;
    status = status === 'undefined' ? undefined : status;
    branchId = branchId === 'undefined' ? undefined : branchId;

    let where: FindOptionsWhere<Promotion> | FindOptionsWhere<Promotion>[];

    if (branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
        relations: ['spa'],
      });
      if (!branch) throw new NotFoundException('Branch not found');
    }

    if (search) {
      const searchCondition = `%${search.toLowerCase()}%`;
      where = [
        {
          branch: {
            id: branchId,
            spa: { id: spaId },
          },
          name: Raw((alias) => `LOWER(${alias}) LIKE :search`, {
            search: searchCondition,
          }),
          status: status as EntityStatus,
        },
        {
          branch: {
            id: branchId,
            spa: { id: spaId },
          },
          code: Raw((alias) => `LOWER(${alias}) LIKE :search`, {
            search: searchCondition,
          }),
          status: status as EntityStatus,
        },
      ];
    } else {
      where = {
        branch: {
          id: branchId,
          spa: { id: spaId },
        },
        status: status as EntityStatus,
      };
    }
    if (page && limit && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;

      const [promotions, total] = await this.promotionRepository.findAndCount({
        where,
        relations: ['branch', 'branch.spa', 'media'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      });
      return paginate({ page, limit }, total, promotions);
    }
    const promotions = await this.promotionRepository.find({
      where,
      relations: ['branch', 'branch.spa', 'media'],
      order: { createdAt: 'DESC' },
    });
    return paginate(
      { page: 1, limit: promotions.length },
      promotions.length,
      promotions,
    );
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['branch', 'branch.spa', 'media'],
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return promotion;
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);
    if (dto.branchId) {
      promotion.branch = await this.branchRepository.findOne({
        where: { id: dto.branchId },
      });
    }

    // Handle media unlinking - unlink all media not in the new list
    if (dto.mediaIds !== undefined) {
      // First, unlink old media (set promotion to null for media not in the new list)
      const oldMediaIds = promotion.media?.map((m) => m.id) || [];
      const mediaIdsToUnlink = oldMediaIds.filter(
        (id) => !dto.mediaIds?.includes(id),
      );

      if (mediaIdsToUnlink.length > 0) {
        await this.mediaRepository.update(
          { id: In(mediaIdsToUnlink) },
          { promotion: null },
        );
      }

      // Then, link new media to this promotion
      if (dto.mediaIds.length > 0) {
        await this.mediaRepository.update(
          { id: In(dto.mediaIds) },
          { promotion },
        );
      }
    }

    // Remove mediaIds from the object assignment since it's not a column
    const { mediaIds, ...dtoWithoutMediaIds } = dto;
    Object.assign(promotion, dtoWithoutMediaIds);
    const savedPromotion = await this.promotionRepository.save(promotion);

    // Link new media to promotion if mediaIds are provided
    if (mediaIds && mediaIds.length > 0) {
      await this.mediaRepository.update(
        { id: In(mediaIds) },
        { promotion: savedPromotion },
      );
    }

    // Return promotion with linked media
    return await this.promotionRepository.findOne({
      where: { id: savedPromotion.id },
      relations: ['branch', 'branch.spa', 'media'],
    });
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
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
      relations: ['branch', 'branch.spa'],
      order: { createdAt: 'DESC' },
    });

    // Filter by max used
    const activePromotions = promotions.filter(
      (p) => !p.maxUsed || p.used < p.maxUsed,
    );

    return activePromotions;
  }
}
