import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, EntityManager } from 'typeorm';
import { Programme } from 'src/entities/programmes.entity';
import { ProgrammeStep } from 'src/entities/programmes_step.entity';
import { ProgrammeTranslation } from 'src/entities/programme_translation.entity';
import { ProgrammeStepTranslation } from 'src/entities/programme_step_translation.entity';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import {
  getPaginationQueryTypeORM,
  paginate,
} from 'src/shared/pagination.util';
import { PaginationParams } from 'src/shared/pagination.types';
import { CreateProgrammeDto, UpdateProgrammeDto } from './programmes.types';

@Injectable()
export class ProgrammesService {
  constructor(
    @InjectRepository(Programme)
    private programmeRepo: Repository<Programme>,
    @InjectRepository(ProgrammeStep)
    private stepRepo: Repository<ProgrammeStep>,
    @InjectRepository(ProgrammeTranslation)
    private translationRepo: Repository<ProgrammeTranslation>,
    @InjectRepository(ProgrammeStepTranslation)
    private stepTranslationRepo: Repository<ProgrammeStepTranslation>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateProgrammeDto) {
    const savedProgrammeId = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const branch = await manager.findOne(Branch, {
          where: { id: dto.branchId },
        });
        if (!branch) {
          throw new NotFoundException(
            `Branch with ID ${dto.branchId} not found`,
          );
        }

        const programme = new Programme();
        programme.branch = branch;
        programme.name = dto.name;
        programme.description = dto.description || null;
        programme.price = dto.price || null;
        programme.maxConcurrentBookings = dto.maxConcurrentBookings || null;
        programme.maxBookingsPerDay = dto.maxBookingsPerDay || null;

        const savedProgramme = await manager.save(programme);

        // Handle media associations
        if (dto.mediaIds && dto.mediaIds.length > 0) {
          const mediaList = await manager.find(Media, {
            where: { id: In(dto.mediaIds) },
          });

          for (const media of mediaList) {
            media.programme = savedProgramme;
            await manager.save(media);
          }
        }

        // Create translations
        if (dto.translations && dto.translations.length > 0) {
          const translations = dto.translations.map((t) => {
            const translation = new ProgrammeTranslation();
            translation.programme = savedProgramme;
            translation.languageCode = t.languageCode;
            translation.name = t.name;
            translation.description = t.description || null;
            return translation;
          });
          await manager.save(translations);
        }

        // Create steps with their translations
        if (dto.steps && dto.steps.length > 0) {
          for (const stepDto of dto.steps) {
            const step = new ProgrammeStep();
            step.programme = savedProgramme;
            step.title = stepDto.title;
            step.description = stepDto.description || null;
            step.duration = stepDto.duration || null;

            const savedStep = await manager.save(step);

            // Create step translations
            if (stepDto.translations && stepDto.translations.length > 0) {
              const stepTranslations = stepDto.translations.map((t) => {
                const translation = new ProgrammeStepTranslation();
                translation.programmeStep = savedStep;
                translation.languageCode = t.languageCode;
                translation.title = t.title;
                translation.description = t.description || null;
                return translation;
              });
              await manager.save(stepTranslations);
            }
          }
        }

        return savedProgramme.id;
      },
    );

    // Call findById after transaction completes
    return this.findById(savedProgrammeId);
  }

  async findAll(
    branchId: string,
    paginationParams?: PaginationParams,
    search?: string,
    status?: string,
  ) {
    const query = this.programmeRepo
      .createQueryBuilder('programme')
      .leftJoinAndSelect('programme.translations', 'translations')
      .leftJoinAndSelect('programme.steps', 'steps')
      .leftJoinAndSelect('steps.translations', 'stepTranslations')
      .leftJoinAndSelect('programme.media', 'media')
      .where('programme.branchId = :branchId', { branchId })
      .andWhere('programme.deletedAt IS NULL');

    // Add search filter
    if (search && search.trim()) {
      query.andWhere(
        '(LOWER(programme.name) LIKE LOWER(:search) OR LOWER(programme.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Add status filter
    if (status && status.trim()) {
      const statusLower = status.toLocaleLowerCase();
      query.andWhere('programme.status = :status', { status: statusLower });
    }

    // Handle pagination
    if (!paginationParams) {
      // Fallback to non-paginated response for backward compatibility
      return await query.getMany();
    }

    const { skip, take } = getPaginationQueryTypeORM(paginationParams);
    const [results, totalCount] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return paginate(paginationParams, totalCount, results);
  }

  async findById(id: string) {
    const programme = await this.programmeRepo
      .createQueryBuilder('programme')
      .leftJoinAndSelect('programme.translations', 'translations')
      .leftJoinAndSelect('programme.steps', 'steps')
      .leftJoinAndSelect('steps.translations', 'stepTranslations')
      .leftJoinAndSelect('programme.media', 'media')
      .where('programme.id = :id', { id })
      .andWhere('programme.deletedAt IS NULL')
      .getOne();

    if (!programme) {
      throw new NotFoundException(`Programme with ID ${id} not found`);
    }

    return programme;
  }

  async update(id: string, dto: UpdateProgrammeDto) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const programme = await manager.findOne(Programme, {
        where: { id },
      });

      if (!programme) {
        throw new NotFoundException(`Programme with ID ${id} not found`);
      }

      // Update basic fields
      if (dto.name !== undefined) programme.name = dto.name;
      if (dto.description !== undefined)
        programme.description = dto.description;
      if (dto.price !== undefined) programme.price = dto.price;
      if (dto.maxConcurrentBookings !== undefined)
        programme.maxConcurrentBookings = dto.maxConcurrentBookings;
      if (dto.maxBookingsPerDay !== undefined)
        programme.maxBookingsPerDay = dto.maxBookingsPerDay;

      await manager.save(programme);

      // Update translations
      if (dto.translations && dto.translations.length > 0) {
        // Delete existing translations for this programme
        await manager.delete(ProgrammeTranslation, { programme: { id } });

        // Create new translations
        const translations = dto.translations.map((t) => {
          const translation = new ProgrammeTranslation();
          translation.programme = programme;
          translation.languageCode = t.languageCode;
          translation.name = t.name;
          translation.description = t.description || null;
          return translation;
        });
        await manager.save(translations);
      }

      // Update steps
      if (dto.steps !== undefined) {
        const existingSteps = await manager.find(ProgrammeStep, {
          where: { programme: { id } },
        });

        // Delete steps that are not in the update
        const stepIdsToKeep = dto.steps.filter((s) => s.id).map((s) => s.id);
        for (const step of existingSteps) {
          if (!stepIdsToKeep.includes(step.id)) {
            await manager.softRemove(step);
          }
        }

        // Create or update steps
        for (const stepDto of dto.steps) {
          if (stepDto.id) {
            // Update existing step
            const step = await manager.findOne(ProgrammeStep, {
              where: { id: stepDto.id },
            });
            if (step) {
              step.title = stepDto.title;
              step.description = stepDto.description || null;
              step.duration = stepDto.duration || null;
              await manager.save(step);

              // Update step translations
              if (stepDto.translations && stepDto.translations.length > 0) {
                await manager.delete(ProgrammeStepTranslation, {
                  programmeStep: { id: step.id },
                });

                const stepTranslations = stepDto.translations.map((t) => {
                  const translation = new ProgrammeStepTranslation();
                  translation.programmeStep = step;
                  translation.languageCode = t.languageCode;
                  translation.title = t.title;
                  translation.description = t.description || null;
                  return translation;
                });
                await manager.save(stepTranslations);
              }
            }
          } else {
            // Create new step
            const step = new ProgrammeStep();
            step.programme = programme;
            step.title = stepDto.title;
            step.description = stepDto.description || null;
            step.duration = stepDto.duration || null;

            const savedStep = await manager.save(step);

            // Create step translations
            if (stepDto.translations && stepDto.translations.length > 0) {
              const stepTranslations = stepDto.translations.map((t) => {
                const translation = new ProgrammeStepTranslation();
                translation.programmeStep = savedStep;
                translation.languageCode = t.languageCode;
                translation.title = t.title;
                translation.description = t.description || null;
                return translation;
              });
              await manager.save(stepTranslations);
            }
          }
        }
      }

      // Update media associations
      if (dto.mediaIds !== undefined) {
        // Clear existing media associations
        const existingMedia = await manager.find(Media, {
          where: { programme: { id } },
        });
        for (const media of existingMedia) {
          media.programme = null;
          await manager.save(media);
        }

        // Associate new media
        if (dto.mediaIds.length > 0) {
          const mediaList = await manager.find(Media, {
            where: { id: In(dto.mediaIds) },
          });

          for (const media of mediaList) {
            media.programme = programme;
            await manager.save(media);
          }
        }
      }

      return this.findById(id);
    });
  }

  async remove(id: string) {
    const programme = await this.programmeRepo.findOne({
      where: { id },
    });

    if (!programme) {
      throw new NotFoundException(`Programme with ID ${id} not found`);
    }

    await this.programmeRepo.softRemove(programme);
    return { message: 'Programme deleted successfully' };
  }

  async restore(id: string) {
    const programme = await this.programmeRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!programme) {
      throw new NotFoundException(`Programme with ID ${id} not found`);
    }

    await this.programmeRepo.recover(programme);
    return this.findById(id);
  }
}
