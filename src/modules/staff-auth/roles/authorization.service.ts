import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../../entities/staffs.entity';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async hasPermissions(staffId: string, required: string[]) {
    if (!required || required.length === 0) return true;
    const staff = await this.staffRepo.findOne({
      where: { id: staffId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!staff) return false;
    const perms = new Set<string>();
    (staff.roles || []).forEach((r: any) => {
      (r.permissions || []).forEach((p: any) => perms.add(p.name));
    });
    return required.every((p) => perms.has(p));
  }
}
