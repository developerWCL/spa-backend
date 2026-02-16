import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgrammesService } from './programmes.service';
import { ProgrammesController } from './programmes.controller';
import { Programme } from 'src/entities/programmes.entity';
import { ProgrammeStep } from 'src/entities/programmes_step.entity';
import { ProgrammeTranslation } from 'src/entities/programme_translation.entity';
import { ProgrammeStepTranslation } from 'src/entities/programme_step_translation.entity';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Programme,
      ProgrammeStep,
      ProgrammeTranslation,
      ProgrammeStepTranslation,
      Branch,
      Media,
    ]),
    StaffAuthModule,
  ],
  controllers: [ProgrammesController],
  providers: [ProgrammesService],
  exports: [ProgrammesService],
})
export class ProgrammesModule {}
