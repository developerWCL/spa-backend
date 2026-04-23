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
import { StaffDayoff } from '../../../entities/staff-dayoff.entity';
import { hashPassword } from '../../../shared/password.util';
import {
  paginate,
  getPaginationQueryTypeORM,
} from '../../../shared/pagination.util';
import { PaginationParams } from '../../../shared/pagination.types';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';
import { Roles } from 'src/decorator/roles.decorator';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(StaffDayoff)
    private readonly staffDayoffRepo: Repository<StaffDayoff>,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('StaffsService');
  }

  async list(
    paginationParams: PaginationParams,
    branchIds?: string[],
    spaIds?: string[],
    filters?: { search?: string; isActive?: boolean; date?: string },
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

    // Filter out staff with day off on the specified date
    if (filters?.date) {
      const dayOffs = await this.staffDayoffRepo.find({
        where: { date: new Date(filters.date) },
        select: ['staffId'],
      });
      const staffIdsWithDayOff = dayOffs.map((dayOff) => dayOff.staffId);
      if (staffIdsWithDayOff.length > 0) {
        query.andWhere('staff.id NOT IN (:...dayOffStaffIds)', {
          dayOffStaffIds: staffIdsWithDayOff,
        });
      }
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
    if (!s) {
      this.logger.error('Staff not found', null, { staffId: id });
      throw new NotFoundException('Staff not found');
    }
    return s;
  }

  async create(
    dto: CreateStaffDto,
    requestingStaffBranchIds?: string[],
    requestingStaffSpaIds?: string[],
    actorId?: string,
    actorName?: string,
  ) {
    this.logger.log('Creating staff', { email: dto.email });
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

    // find branch and staff email must be unique
    const existingStaff = await this.staffRepo.findOne({
      where: { email: dto.email, branches: { id: In(uniqueBranchIds) } },
    });
    if (existingStaff) {
      throw new ForbiddenException('Email already in use');
    }

    const staff = new Staff();
    staff.firstName = dto.firstName;
    staff.lastName = dto.lastName;
    staff.email = dto.email;
    staff.branches = branches;
    staff.isActive = true;
    staff.phone = dto.phone;
    staff.specialties = dto.specialties;
    staff.workingHours = dto.workingHours;

    if (dto.password) {
      staff.passwordHash = await hashPassword(dto.password);
    }

    if (dto.roleIds && dto.roleIds.length) {
      const roles = await this.roleRepo.findBy({ id: In(dto.roleIds) } as any);
      staff.roles = roles;
    }

    const savedStaff = await this.staffRepo.save(staff);

    // Log the action
    await this.actionLogService.logAction({
      feature: 'staff',
      subFeature: null,
      actionType: 'create',
      actorId,
      actorName,
      entityType: 'staff',
      entityId: savedStaff.id,
      newData: {
        firstName: savedStaff.firstName,
        lastName: savedStaff.lastName,
        email: savedStaff.email,
        phone: savedStaff.phone,
        specialties: savedStaff.specialties,
        workingHours: savedStaff.workingHours,
        isActive: savedStaff.isActive,
        branchIds: branches.map((b) => b.id),
        roles: savedStaff.roles?.map((r) => r.name) || [],
      },
      description: `Created staff: ${savedStaff.email} (${savedStaff.firstName} ${savedStaff.lastName})`,
      status: 'success',
      branchId: branches[0]?.id || null,
    });

    return savedStaff;
  }

  async update(
    id: string,
    dto: UpdateStaffDto,
    actorId?: string,
    actorName?: string,
  ) {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!staff) throw new NotFoundException('Staff not found');

    // Store old data for audit trail
    const oldStaff = { ...staff };

    if (dto.firstName) staff.firstName = dto.firstName;
    if (dto.lastName) staff.lastName = dto.lastName;
    if (dto.email) staff.email = dto.email;
    if (dto.password && dto.password != staff.passwordHash)
      staff.passwordHash = await hashPassword(dto.password);
    if (dto.phone) staff.phone = dto.phone;
    if (dto.specialties) staff.specialties = dto.specialties;
    if (dto.workingHours) staff.workingHours = dto.workingHours;

    if (dto.roleIds) {
      const roles = dto.roleIds.length
        ? await this.roleRepo.findBy({ id: In(dto.roleIds) } as any)
        : [];
      staff.roles = roles;
    }

    // find branch and staff email must be unique
    const existingStaff = await this.staffRepo.findOne({
      where: { email: dto.email },
      relations: ['branches'],
    });
    if (existingStaff && existingStaff.id !== id) {
      throw new ForbiddenException('Email already in use');
    }

    const updatedStaff = await this.staffRepo.save(staff);

    // Log the action
    await this.actionLogService.logAction({
      feature: 'staff',
      subFeature: null,
      actionType: 'update',
      actorId,
      actorName,
      entityType: 'staff',
      entityId: id,
      oldData: {
        firstName: oldStaff.firstName,
        lastName: oldStaff.lastName,
        email: oldStaff.email,
        phone: oldStaff.phone,
        specialties: oldStaff.specialties,
        workingHours: oldStaff.workingHours,
        roles: oldStaff.roles?.map((r) => r.name) || [],
      },
      newData: {
        firstName: updatedStaff.firstName,
        lastName: updatedStaff.lastName,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        specialties: updatedStaff.specialties,
        workingHours: updatedStaff.workingHours,
        roles: updatedStaff.roles?.map((r) => r.name) || [],
      },
      description: `Updated staff: ${updatedStaff.email}`,
      status: 'success',
      branchId: existingStaff?.branches?.[0]?.id || null,
    });

    return updatedStaff;
  }

  async remove(id: string, actorId?: string, actorName?: string) {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['branches'],
    });
    if (!staff) throw new NotFoundException('Staff not found');

    // Log the action before deletion
    await this.actionLogService.logAction({
      feature: 'staff',
      subFeature: null,
      actionType: 'delete',
      actorId,
      actorName,
      entityType: 'staff',
      entityId: id,
      oldData: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        specialties: staff.specialties,
        workingHours: staff.workingHours,
        isActive: staff.isActive,
      },
      description: `Deleted staff: ${staff.email} (${staff.firstName} ${staff.lastName})`,
      status: 'success',
      branchId: staff.branches?.[0]?.id || null,
    });

    await this.staffRepo.softDelete(id);
    return { deleted: true };
  }
}
