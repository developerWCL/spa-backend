import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffDayoff } from 'src/entities/staff-dayoff.entity';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import {
  PaginationParams,
  PaginatedResponse,
} from 'src/shared/pagination.types';
import {
  CreateStaffDayoffDto,
  UpdateStaffDayoffDto,
} from './staff-dayoff.types';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';
import { Staff } from 'src/entities/staffs.entity';

@Injectable()
export class StaffDayoffService {
  constructor(
    @InjectRepository(StaffDayoff)
    private readonly staffDayoffRepo: Repository<StaffDayoff>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('StaffDayoffService');
  }

  async create(
    dto: CreateStaffDayoffDto,
    actorId?: string,
    actorName?: string,
  ): Promise<StaffDayoff> {
    this.logger.log('Creating staff dayoff', { staffId: dto.staffId });
    const staff = await this.staffRepo.manager.findOne(Staff, {
      where: { id: dto.staffId },
      relations: ['branches'],
    });

    if (!staff) {
      this.logger.error('Staff not found', null, { staffId: dto.staffId });
      throw new NotFoundException('Staff not found');
    }
    const staffDayoff = this.staffDayoffRepo.create(dto);
    const saved = await this.staffDayoffRepo.save(staffDayoff);
    this.logger.log('Staff dayoff created successfully', {
      dayoffId: saved.id,
    });

    // Log the action
    await this.actionLogService.logAction({
      feature: 'daily',
      subFeature: 'staff_dayoff',
      actionType: 'create',
      actorId,
      actorName,
      entityType: 'staff_dayoff',
      entityId: saved.id,
      newData: {
        staffId: saved.staffId,
        date: saved.date,
        reason: saved.reason || null,
      },
      description: `Created staff dayoff for staff: ${saved.staffId}`,
      status: 'success',
      branchId: staff.branches?.[0]?.id || null,
    });

    return saved;
  }

  async findAll(
    branchId?: string,
    paginationParams?: PaginationParams,
    filters?: { search?: string },
  ): Promise<StaffDayoff[] | PaginatedResponse<StaffDayoff>> {
    const query = this.staffDayoffRepo
      .createQueryBuilder('staffDayoff')
      .leftJoinAndSelect('staffDayoff.staff', 'staff');

    if (branchId) {
      query
        .leftJoinAndSelect('staff.branches', 'branch')
        .where('branch.id = :branchId', { branchId });
    }

    // Search filter for staff firstName or lastName
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search)',
        { search: searchTerm },
      );
    }

    if (!paginationParams) {
      // Fallback to non-paginated response for backward compatibility
      return query.orderBy('staffDayoff.createdAt', 'DESC').getMany();
    }

    const { skip, take } = getPaginationQueryTypeORM(paginationParams);

    const [results, total] = await query
      .orderBy('staffDayoff.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
    const totalCount = await query.getCount();
    return paginate(paginationParams, totalCount, results);
  }

  async findOne(id: string, branchId?: string): Promise<StaffDayoff> {
    const query = this.staffDayoffRepo
      .createQueryBuilder('staffDayoff')
      .leftJoinAndSelect('staffDayoff.staff', 'staff')
      .where('staffDayoff.id = :id', { id });

    if (branchId) {
      query
        .leftJoinAndSelect('staff.branches', 'branch')
        .andWhere('branch.id = :branchId', { branchId });
    }

    const staffDayoff = await query.getOne();
    if (!staffDayoff) {
      this.logger.error('Staff dayoff not found', null, { dayoffId: id });
      throw new NotFoundException('Staff dayoff not found');
    }
    return staffDayoff;
  }

  async findByStaffId(
    staffId: string,
    branchId?: string,
  ): Promise<StaffDayoff[]> {
    const query = this.staffDayoffRepo
      .createQueryBuilder('staffDayoff')
      .leftJoinAndSelect('staffDayoff.staff', 'staff')
      .where('staffDayoff.staffId = :staffId', { staffId });

    if (branchId) {
      query
        .leftJoinAndSelect('staff.branches', 'branch')
        .andWhere('branch.id = :branchId', { branchId });
    }

    return query.orderBy('staffDayoff.date', 'DESC').getMany();
  }

  async update(
    id: string,
    dto: UpdateStaffDayoffDto,
    branchId?: string,
    actorId?: string,
    actorName?: string,
  ): Promise<StaffDayoff> {
    const staffDayoff = await this.findOne(id, branchId);

    // Store old data for audit trail
    const oldDayoff = {
      date: staffDayoff.date,
      reason: staffDayoff.reason || null,
      staffId: staffDayoff.staffId,
    };

    Object.assign(staffDayoff, dto);
    const updated = await this.staffDayoffRepo.save(staffDayoff);

    // Log the action
    await this.actionLogService.logAction({
      feature: 'daily',
      subFeature: 'staff_dayoff',
      actionType: 'update',
      actorId,
      actorName,
      entityType: 'staff_dayoff',
      entityId: id,
      oldData: oldDayoff,
      newData: {
        date: updated.date,
        reason: updated.reason || null,
        staffId: updated.staffId,
      },
      description: `Updated staff dayoff: ${updated.staffId}`,
      status: 'success',
      branchId: branchId,
    });

    return updated;
  }

  async remove(
    id: string,
    branchId?: string,
    actorId?: string,
    actorName?: string,
  ): Promise<void> {
    const staffDayoff = await this.findOne(id, branchId);

    // Log the action before deletion
    await this.actionLogService.logAction({
      feature: 'daily',
      subFeature: 'staff_dayoff',
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'staff_dayoff',
      entityId: id,
      oldData: {
        staffId: staffDayoff.staffId,
        date: staffDayoff.date,
        reason: staffDayoff.reason || null,
      },
      description: `Deleted staff dayoff: ${staffDayoff.staffId}`,
      status: 'success',
      branchId: branchId,
    });

    await this.staffDayoffRepo.softDelete(id);
  }
}
