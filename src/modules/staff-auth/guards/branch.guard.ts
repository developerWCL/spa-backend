import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../../entities/staffs.entity';

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const staff = req.staff as {
      sub?: string;
      branchIds?: string[];
      spaIds?: string[];
    };

    if (!staff || !staff.sub) return false;

    // Get the requested resource ID from params
    const { id } = req.params;
    if (!id) return true; // No resource specified, allow

    // For staff endpoints, verify resource belongs to one of their branches/spas
    const requestedStaff = await this.staffRepo.findOne({
      where: { id },
      relations: ['branches', 'branches.spa'],
    });

    if (!requestedStaff) {
      throw new NotFoundException('Staff not found');
    }

    // Check branch access
    if (requestedStaff.branches && staff.branchIds) {
      const requestedBranchIds = requestedStaff.branches.map((b) => b.id);
      const branchAccess = requestedBranchIds.some((branchId) =>
        staff.branchIds?.includes(branchId),
      );

      if (!branchAccess) {
        throw new ForbiddenException(
          'You can only access staff from your assigned branches',
        );
      }
    }

    // Check SPA access (verify requested staff's spa is in requesting staff's spa list)
    if (requestedStaff.branches && staff.spaIds && staff.spaIds.length > 0) {
      const requestedSpaIds = Array.from(
        new Set(
          requestedStaff.branches
            .map((b) => (b.spa as any)?.id)
            .filter(Boolean),
        ),
      );
      const spaAccess = requestedSpaIds.some((spaId) =>
        staff.spaIds?.includes(spaId),
      );

      if (!spaAccess) {
        throw new ForbiddenException(
          'You can only access staff from your assigned spas',
        );
      }
    }

    return true;
  }
}
