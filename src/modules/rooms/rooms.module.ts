import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from 'src/entities/rooms.entity';
import { Branch } from 'src/entities/branch.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Branch]), StaffAuthModule],
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
