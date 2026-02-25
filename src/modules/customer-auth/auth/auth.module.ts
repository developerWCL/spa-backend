import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from '../../../shared/services/mail.service';
import { Customer } from 'src/entities/customers.entity';
import { AuthService } from './customer-auth.service';
import { AuthController } from './customer-auth.controller';
import { CustomerSubmodule } from '../customer/customer.module';
import { JwtModule } from '@nestjs/jwt';
import { Otp } from 'src/entities/otp.entity';
import { Spa } from 'src/entities/spa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Otp, Spa]),
    CustomerSubmodule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret', // Use env or a secure value
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, MailService],
  controllers: [AuthController],
  exports: [AuthService, MailService],
})
export class AuthSubmodule {}
