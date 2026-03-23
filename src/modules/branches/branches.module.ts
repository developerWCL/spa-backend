import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import { BranchOperatingHours } from 'src/entities/branch_operating_hours.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, Media, BranchOperatingHours]),
    StaffAuthModule,
  ],
  providers: [BranchesService],
  controllers: [BranchesController],
  exports: [BranchesService],
})
export class BranchesModule {}
