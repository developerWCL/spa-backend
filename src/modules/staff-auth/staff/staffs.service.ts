import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Staff } from '../../../entities/staffs.entity';
import { Role } from '../../../entities/role.entity';
import { Branch } from '../../../entities/branch.entity';
import { hashPassword } from '../../../shared/password.util';
import {
  paginate,
  getPaginationQueryTypeORM,
} from '../../../shared/pagination.util';
import { PaginationParams } from '../../../shared/pagination.types';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async list(
    paginationParams: PaginationParams,
    branchIds?: string[],
    spaIds?: string[],
    filters?: { search?: string; isActive?: boolean },
  ) {
    const { skip, take } = getPaginationQueryTypeORM(paginationParams);

    const query = this.staffRepo
      .createQueryBuilder('staff')
      .distinct(true)
      .innerJoinAndSelect('staff.branches', 'branches')
      .leftJoinAndSelect('branches.spa', 'spa')
      .leftJoinAndSelect('staff.roles', 'roles');

    // Filter by branches if branchIds provided
    if (branchIds && branchIds.length > 0) {
      query.where('branches.id IN (:...branchIds)', { branchIds });
    }

    // Additional filter by spa if spaIds provided
    if (spaIds && spaIds.length > 0) {
      query.andWhere('spa.id IN (:...spaIds)', { spaIds });
    }

    // Search filter for firstName, lastName, or email
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.email ILIKE :search)',
        { search: searchTerm },
      );
    }

    // Status filter
    if (filters?.isActive !== undefined) {
      query.andWhere('staff.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    const [results, totalCount] = await query
      .skip(skip)
      .take(take)
      .orderBy('staff.createdAt', 'DESC')
      .getManyAndCount();

    return paginate(paginationParams, totalCount, results);
  }

  async get(id: string) {
    const s = await this.staffRepo.findOne({
      where: { id },
      relations: ['branches', 'branches.spa', 'roles'],
    });
    if (!s) throw new NotFoundException('Staff not found');
    return s;
  }

  async create(
    dto: CreateStaffDto,
    requestingStaffBranchIds?: string[],
    requestingStaffSpaIds?: string[],
  ) {
    // Collect all branch IDs from request
    const allBranchIds = [
      ...(dto.branchIds && Array.isArray(dto.branchIds) ? dto.branchIds : []),
    ];
    const uniqueBranchIds = [...new Set(allBranchIds)];

    // Validate that staff can only create users in their assigned branches
    if (requestingStaffBranchIds) {
      const hasAccess = uniqueBranchIds.every((branchId) =>
        requestingStaffBranchIds.includes(branchId),
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'You can only create staff in your assigned branches',
        );
      }
    }

    // Fetch all branches
    const branches = await this.branchRepo.find({
      where: { id: In(uniqueBranchIds) } as any,
      relations: ['spa'],
    });

    if (branches.length === 0) {
      throw new NotFoundException('No valid branches found');
    }

    // Validate SPA access for all branches
    if (requestingStaffSpaIds && requestingStaffSpaIds.length > 0) {
      const hasValidSpaAccess = branches.every((branch) =>
        branch.spa?.id ? requestingStaffSpaIds.includes(branch.spa.id) : true,
      );
      if (!hasValidSpaAccess) {
        throw new ForbiddenException(
          'You can only create staff in your assigned spas',
        );
      }
    }

    const staff = new Staff();
    staff.firstName = dto.firstName;
    staff.lastName = dto.lastName;
    staff.email = dto.email;
    staff.branches = branches;
    staff.isActive = true;

    if (dto.password) {
      staff.passwordHash = await hashPassword(dto.password);
    }

    if (dto.roleIds && dto.roleIds.length) {
      const roles = await this.roleRepo.findBy({ id: In(dto.roleIds) } as any);
      staff.roles = roles;
    }

    return this.staffRepo.save(staff);
  }

  async update(id: string, dto: UpdateStaffDto) {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!staff) throw new NotFoundException('Staff not found');

    if (dto.firstName) staff.firstName = dto.firstName;
    if (dto.lastName) staff.lastName = dto.lastName;
    if (dto.email) staff.email = dto.email;
    if (dto.password) staff.passwordHash = await hashPassword(dto.password);

    if (dto.roleIds) {
      const roles = dto.roleIds.length
        ? await this.roleRepo.findBy({ id: In(dto.roleIds) } as any)
        : [];
      staff.roles = roles;
    }

    return this.staffRepo.save(staff);
  }

  async remove(id: string) {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');
    await this.staffRepo.softDelete(id);
    return { deleted: true };
  }
}
