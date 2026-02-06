import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { Branch } from 'src/entities/branch.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), StaffAuthModule],
  providers: [BranchesService],
  controllers: [BranchesController],
  exports: [BranchesService],
})
export class BranchesModule {}
