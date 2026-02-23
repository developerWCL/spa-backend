import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Raw, Repository } from 'typeorm';
import { Promotion } from '../../entities/promotions.entity';
import { Branch } from '../../entities/branch.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './promotion.dto';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import { paginate } from 'src/shared/pagination.util';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionRepository.create(dto);
    if (dto.branchId) {
      promotion.branch = await this.branchRepository.findOne({
        where: { id: dto.branchId },
      });
    }
    return this.promotionRepository.save(promotion);
  }

  async findAll(
    branchId: string,
    currentUser: any,
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<Promotion>> {
    if (!currentUser.branchIds.includes(branchId)) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const where: FindOptionsWhere<Promotion> = {
      branch: { id: branchId },
    };
    if (search) {
      where.name = Raw((alias) => `LOWER(${alias}) LIKE :search`, {
        search: `%${search.toLowerCase()}%`,
      });
    }
    if (status) {
      where.status = status as EntityStatus;
    }
    const skip = (page - 1) * limit;

    const [promotions, total] = await this.promotionRepository.findAndCount({
      where,
      relations: ['branch'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });
    return paginate({ page, limit }, total, promotions);
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: ['branch'],
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
    Object.assign(promotion, dto);
    return this.promotionRepository.save(promotion);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.softRemove(promotion);
  }
}
