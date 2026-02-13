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

@Injectable()
export class StaffDayoffService {
  constructor(
    @InjectRepository(StaffDayoff)
    private readonly staffDayoffRepo: Repository<StaffDayoff>,
  ) {}

  async create(dto: CreateStaffDayoffDto): Promise<StaffDayoff> {
    const staffDayoff = this.staffDayoffRepo.create(dto);
    return this.staffDayoffRepo.save(staffDayoff);
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

    const [results, totalCount] = await query
      .orderBy('staffDayoff.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

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
    if (!staffDayoff) throw new NotFoundException('Staff dayoff not found');
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
  ): Promise<StaffDayoff> {
    const staffDayoff = await this.findOne(id, branchId);
    Object.assign(staffDayoff, dto);
    return this.staffDayoffRepo.save(staffDayoff);
  }

  async remove(id: string, branchId?: string): Promise<void> {
    await this.findOne(id, branchId);
    await this.staffDayoffRepo.softDelete(id);
  }
}
