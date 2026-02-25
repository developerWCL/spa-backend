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
            type: 'registration',
            spa: { id: spaId },
          },
        });
        if (!customer || !otpRecord || otpRecord.expiresAt < new Date())
          throw new BadRequestException('Invalid or expired OTP');
        customer.isVerified = true;
        await otpRepo.update(otpRecord.id, { usedAt: new Date() });
        await this.customerService.update(customer.id, customer, entityManager);
        return { message: 'Verified' };
      },
    );
  }

  async login(email: string, password: string) {
    const customer = await this.customerService.findByEmail(
      email.toLowerCase(),
    );
    if (!customer || !customer.isVerified)
      throw new UnauthorizedException('Not verified');
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: customer.id, email: customer.email };
    return {
      access_token: this.jwtService.sign(payload),
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        spaIds: customer.spa ? [customer.spa.id] : [],
      },
    };
  }
}
