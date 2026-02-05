import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Staff } from '../../../entities/staffs.entity';
import { sign, verify } from 'jsonwebtoken';
import { MailService } from '../../../shared/services/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class StaffAuthService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    private readonly mailService: MailService,
  ) {}

  async validateCredentials(email: string, password: string) {
    const staff = await this.staffRepo.findOne({
      where: { email },
      relations: ['branches', 'branches.spa', 'roles', 'roles.permissions'],
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
    const refreshSecret =
      process.env.STAFF_REFRESH_JWT_SECRET || 'staff-refresh-dev-secret';
    const accessTokenExpiry = process.env.STAFF_JWT_EXPIRES_IN || '1d';
    const refreshTokenExpiry = process.env.STAFF_REFRESH_JWT_EXPIRES_IN || '7d';

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
      { expiresIn: accessTokenExpiry } as any,
    );

    const refreshToken = sign(
      { sub: staff.id } as any,
      refreshSecret as any,
      { expiresIn: refreshTokenExpiry } as any,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
      staff,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret =
        process.env.STAFF_REFRESH_JWT_SECRET || 'staff-refresh-dev-secret';
      const secret = process.env.STAFF_JWT_SECRET || 'staff-dev-secret';
      const accessTokenExpiry = process.env.STAFF_JWT_EXPIRES_IN || '1d';

      const decoded = verify(refreshToken, refreshSecret) as any;
      const staff = await this.staffRepo.findOne({
        where: { id: decoded.sub },
        relations: ['branches', 'branches.spa', 'roles'],
      });

      if (!staff || !staff.isActive) {
        return {
          success: false,
          message: 'Staff member not found or inactive',
        };
      }

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
        { expiresIn: accessTokenExpiry } as any,
      );

      const { passwordHash, ...staffWithoutPassword } = staff as any;

      return {
        success: true,
        accessToken,
        expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
        staff: staffWithoutPassword as Partial<Staff>,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }
  }

  private parseExpiryToSeconds(expiryString: string): number {
    const match = expiryString.match(/^(\d+)([dhms])$/);
    if (!match) return 86400; // default 1 day

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        return value * 86400;
      case 'h':
        return value * 3600;
      case 'm':
        return value * 60;
      case 's':
        return value;
      default:
        return 86400;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const staff = await this.staffRepo.findOne({ where: { email } });
    if (!staff) {
      throw new BadRequestException('Staff member not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24); // Token valid for 24 hours

    // Save token to database
    await this.staffRepo.update(staff.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expiryTime,
    });

    // Send email
    const staffName = `${staff.firstName} ${staff.lastName}`;
    try {
      await this.mailService.sendPasswordResetEmail(
        email,
        resetToken,
        staffName,
      );
    } catch (error) {
      console.error('Failed to send reset email:', error);
      // Clear token if email fails
      await this.staffRepo.update(staff.id, {
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      throw new BadRequestException('Failed to send reset email');
    }

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const staff = await this.staffRepo.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!staff) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (
      !staff.passwordResetExpires ||
      staff.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await this.staffRepo.update(staff.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Send confirmation email
    const staffName = `${staff.firstName} ${staff.lastName}`;
    try {
      await this.mailService.sendPasswordChangedEmail(staff.email, staffName);
    } catch (error) {
      // Log error but don't fail the reset
      console.error('Failed to send confirmation email:', error);
    }

    return { message: 'Password reset successfully' };
  }

  logout(): { message: string } {
    return { message: 'Logged out successfully' };
  }
}
