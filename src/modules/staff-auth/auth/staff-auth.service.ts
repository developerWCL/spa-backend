import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Staff } from '../../../entities/staffs.entity';
import { sign } from 'jsonwebtoken';

@Injectable()
export class StaffAuthService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async validateCredentials(email: string, password: string) {
    const staff = await this.staffRepo.findOne({
      where: { email },
      relations: ['branches', 'branches.spa', 'roles'],
    });
    if (!staff) return null;
    if (!staff.isActive) return null;
    const ok = staff.passwordHash
      ? await bcrypt.compare(password, staff.passwordHash)
      : false;
    if (!ok) return null;
    // omit passwordHash when returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = staff as any;
    return rest as Partial<Staff>;
  }

  async login(email: string, password: string) {
    const staff = await this.validateCredentials(email, password);
    if (!staff) throw new UnauthorizedException('Invalid credentials');

    const secret = process.env.STAFF_JWT_SECRET || 'staff-dev-secret';
    const expiresIn = process.env.STAFF_JWT_EXPIRES_IN || '8h';

    const branchIds = ((staff as any).branches || []).map((b: any) => b.id);
    const spaIds = Array.from(
      new Set(
        ((staff as any).branches || [])
          .map((b: any) => b.spa?.id)
          .filter(Boolean),
      ),
    );
    const roleNames = ((staff as any).roles || []).map((r: any) => r.name);

    const payload = {
      sub: staff.id,
      roles: roleNames,
      branchIds,
      spaIds,
      email: staff.email,
    } as Record<string, unknown>;

    const accessToken = sign(
      payload as any,
      secret as any,
      { expiresIn } as any,
    );

    return { accessToken, expiresIn, staff };
  }
}
