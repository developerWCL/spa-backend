import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomBedClosureService } from './room-bed-closure.service';
import { RoomBedClosureController } from './room-bed-closure.controller';
import { RoomBedClosure } from 'src/entities/room_bed_closure.entity';
import { Room } from 'src/entities/rooms.entity';
import { Bed } from 'src/entities/beds.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomBedClosure, Room, Bed]),
    StaffAuthModule,
  ],
  providers: [RoomBedClosureService],
  controllers: [RoomBedClosureController],
  exports: [RoomBedClosureService],
})
export class RoomBedClosureModule {}
