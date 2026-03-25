import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomerService } from '../customer/customer.service';
import { Otp } from 'src/entities/otp.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customers.entity';
import { MailService } from 'src/shared/services/mail.service';
import { Spa } from 'src/entities/spa.entity';
import { GoogleOAuthService, GoogleUserInfo } from './google-oauth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly mailService: MailService,
    @InjectRepository(Spa)
    private readonly spaRepository: Repository<Spa>,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    spaId: string,
  ) {
    const existing = await this.customerService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');
    const hashed = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Use transaction for atomicity
    await this.customerRepo.manager.transaction(async (entityManager) => {
      // Create customer
      const spa = await entityManager.findOne(Spa, { where: { id: spaId } });
      if (!spa) throw new BadRequestException('Invalid spaId');
      await this.customerService.create(
        {
          email: email.toLowerCase(),
          password: hashed,
          firstName,
          lastName,
          phone,
          spa: spa,
          isVerified: true,
        },
        entityManager,
      );
      // Save OTP
      const otpRepo = entityManager.getRepository(Otp);
      await otpRepo.save(
        otpRepo.create({
          email: email.toLowerCase(),
          code: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          type: 'registration',
          spa: spa,
        }),
      );
    });
    try {
      await this.mailService.sendOtpEmail(email.toLowerCase(), otpCode);
    } catch (error) {
      // Log error but don't fail the reset
      console.error('Failed to send OTP email:', error);
    }
    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email: string, otp: string, spaId: string) {
    return await this.customerRepo.manager.transaction(
      async (entityManager) => {
        const customer = await this.customerService.findByEmail(
          email.toLowerCase(),
        );
        const otpRepo = entityManager.getRepository(Otp);
        const otpRecord = await otpRepo.findOne({
          where: {
            email: email.toLowerCase(),
            code: otp,
            spa: { id: spaId },
          },
        });
        if (!customer || !otpRecord || otpRecord.expiresAt < new Date())
          throw new BadRequestException('Invalid or expired OTP');

        // Determine OTP type for sending appropriate email
        const otpType = otpRecord.type;

        customer.isVerified = true;
        await otpRepo.update(otpRecord.id, { usedAt: new Date() });
        await this.customerService.update(customer.id, customer, entityManager);

        // Send appropriate email based on OTP type
        try {
          if (otpType === 'registration') {
            await this.mailService.sendRegistrationVerificationEmail(
              customer.email,
              customer.firstName,
            );
          } else if (otpType === 'password_reset') {
            await this.mailService.sendPasswordResetVerificationEmail(
              customer.email,
              customer.firstName,
            );
          }
        } catch (error) {
          console.error('Failed to send verification email:', error);
          // Don't fail the verification if email sending fails
        }

        return { message: 'Verified' };
      },
    );
  }

  async resendOtp(email: string, spaId: string) {
    const customer = await this.customerService.findByEmail(
      email.toLowerCase(),
    );
    if (!customer) throw new BadRequestException('Customer not found');

    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) throw new BadRequestException('Invalid spaId');

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Use transaction for atomicity
    await this.otpRepository.manager.transaction(async (entityManager) => {
      // Mark previous OTPs as expired/revoked (optional: you could delete or mark them)
      const otpRepo = entityManager.getRepository(Otp);
      await otpRepo.update(
        {
          email: email.toLowerCase(),
          usedAt: null,
          spa: { id: spaId },
        },
        { usedAt: new Date() },
      );

      // Create new OTP
      await otpRepo.save(
        otpRepo.create({
          email: email.toLowerCase(),
          code: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          type: 'registration',
          spa: spa,
        }),
      );
    });

    try {
      await this.mailService.sendOtpEmail(email.toLowerCase(), otpCode);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP resent to email' };
  }

  async login(email: string, password: string) {
    const customer = await this.customerService.findByEmail(
      email.toLowerCase(),
    );
    console.log('customer', customer);
    const plain = 'Test@1234';
    const hash = '$2b$10$u58heCimYBVOiNQv0814uexfzz/FKjnKPzeFdf2V3/hQeWTPTIjgK';

    bcrypt.compare(plain, hash).then((res) => {
      console.log('Is it valid?', res); // Should be true
    });
    if (!customer || !customer.isVerified)
      throw new UnauthorizedException('Not verified');
    const valid = await bcrypt.compare(password, customer.password);
    console.log('password', password);
    console.log('customer.password', customer.password);

    console.log('valid', valid);

    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: customer.id, email: customer.email };
    console.log('customer', customer.spa.id);

    return {
      accessToken: this.jwtService.sign(payload),
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        spaIds: customer.spa ? [customer.spa.id] : [],
      },
    };
  }

  /**
   * Login or create customer with Google OAuth
   * @param googleUserInfo - User info from Google (via NextAuth)
   * @param spaId - Spa ID to associate customer with
   * @returns Access token and customer info
   */
  async loginWithGoogle(googleUserInfo: GoogleUserInfo, spaId: string) {
    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) throw new BadRequestException('Invalid spaId');

    return await this.customerRepo.manager.transaction(
      async (entityManager) => {
        const customerRepo = entityManager.getRepository(Customer);

        let customer = await customerRepo.findOne({
          where: {
            email: googleUserInfo.email.toLowerCase(),
            spa: { id: spaId },
          },
          relations: ['spa'],
        });

        // If customer doesn't exist, create new one
        if (!customer) {
          customer = customerRepo.create({
            email: googleUserInfo.email.toLowerCase(),
            firstName: googleUserInfo.firstName,
            lastName: googleUserInfo.lastName,
            password: null, // No password for OAuth users
            authProvider: 'google',
            isVerified: true, // Auto-verify Google users
            spa: spa,
          });
          await customerRepo.save(customer);
        } else {
          // Update authProvider if it was a local account
          if (customer.authProvider === 'local' || !customer.authProvider) {
            customer.authProvider = 'google';
            customer.isVerified = true;
            await customerRepo.save(customer);
          }
        }

        const payload = { sub: customer.id, email: customer.email };

        return {
          accessToken: this.jwtService.sign(payload),
          customer: {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            authProvider: customer.authProvider,
            spaIds: customer.spa ? [customer.spa.id] : [],
          },
        };
      },
    );
  }

  /**
   * Verify Google ID token and login/create customer
   * @param idToken - Google ID token from NextAuth
   * @param spaId - Spa ID to associate customer with
   * @returns Access token and customer info
   */
  async loginWithGoogleIdToken(idToken: string, spaId: string) {
    const googleUserInfo = await this.googleOAuthService.verifyIdToken(idToken);
    return this.loginWithGoogle(googleUserInfo, spaId);
  }

  async requestPasswordReset(email: string, spaId: string) {
    const customer = await this.customerService.findByEmail(
      email.toLowerCase(),
    );
    if (!customer) throw new BadRequestException('Email not found');

    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) throw new BadRequestException('Invalid spaId');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Use transaction for atomicity
    await this.otpRepository.manager.transaction(async (entityManager) => {
      const otpRepo = entityManager.getRepository(Otp);

      // Invalidate previous password reset OTPs
      await otpRepo.update(
        {
          email: email.toLowerCase(),
          type: 'password_reset',
          usedAt: null,
          spa: { id: spaId },
        },
        { usedAt: new Date() },
      );

      // Create new password reset OTP
      await otpRepo.save(
        otpRepo.create({
          email: email.toLowerCase(),
          code: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          type: 'password_reset',
          spa: spa,
        }),
      );
    });

    try {
      await this.mailService.sendOtpEmail(email.toLowerCase(), otpCode);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    return { message: 'OTP sent to email' };
  }

  async verifyPasswordResetOtp(email: string, otp: string, spaId: string) {
    return await this.customerRepo.manager.transaction(
      async (entityManager) => {
        const customer = await this.customerService.findByEmail(
          email.toLowerCase(),
        );
        const otpRepo = entityManager.getRepository(Otp);
        const otpRecord = await otpRepo.findOne({
          where: {
            email: email.toLowerCase(),
            code: otp,
            type: 'password_reset',
            spa: { id: spaId },
          },
        });

        if (!customer || !otpRecord || otpRecord.expiresAt < new Date()) {
          throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark OTP as used
        await otpRepo.update(otpRecord.id, { usedAt: new Date() });

        return { message: 'OTP verified' };
      },
    );
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    spaId: string,
  ) {
    return await this.customerRepo.manager.transaction(
      async (entityManager) => {
        const customer = await this.customerService.findByEmail(
          email.toLowerCase(),
        );
        const otpRepo = entityManager.getRepository(Otp);

        // Verify OTP exists and was used for password reset
        const otpRecord = await otpRepo.findOne({
          where: {
            email: email.toLowerCase(),
            code: otp,
            type: 'password_reset',
            spa: { id: spaId },
          },
        });

        if (!customer || !otpRecord || otpRecord.expiresAt < new Date()) {
          throw new BadRequestException('Invalid or expired OTP');
        }

        // Update customer password
        customer.password = newPassword;
        await this.customerService.update(customer.id, customer, entityManager);

        try {
          await this.mailService.sendPasswordResetVerificationEmail(
            customer.email,
            customer.firstName,
          );
        } catch (error) {
          console.error('Failed to send password reset confirmation:', error);
        }

        return { message: 'Password reset successfully' };
      },
    );
  }

  async resendPasswordResetOtp(email: string, spaId: string) {
    const customer = await this.customerService.findByEmail(
      email.toLowerCase(),
    );
    if (!customer) throw new BadRequestException('Email not found');

    const spa = await this.spaRepository.findOne({ where: { id: spaId } });
    if (!spa) throw new BadRequestException('Invalid spaId');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.otpRepository.manager.transaction(async (entityManager) => {
      const otpRepo = entityManager.getRepository(Otp);

      // Invalidate previous password reset OTPs
      await otpRepo.update(
        {
          email: email.toLowerCase(),
          type: 'password_reset',
          usedAt: null,
          spa: { id: spaId },
        },
        { usedAt: new Date() },
      );

      // Create new OTP
      await otpRepo.save(
        otpRepo.create({
          email: email.toLowerCase(),
          code: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          type: 'password_reset',
          spa: spa,
        }),
      );
    });

    try {
      await this.mailService.sendOtpEmail(email.toLowerCase(), otpCode);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP resent to email' };
  }
}
