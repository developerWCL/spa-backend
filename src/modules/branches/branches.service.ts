import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Branch } from 'src/entities/branch.entity';
import { Media } from 'src/entities/media.entity';
import { BranchOperatingHours } from 'src/entities/branch_operating_hours.entity';
import { CreateBranchDto, UpdateBranchDto } from './branches.types';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(BranchOperatingHours)
    private readonly operatingHoursRepo: Repository<BranchOperatingHours>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('BranchesService');
  }

  async create(dto: CreateBranchDto): Promise<Branch> {
    this.logger.log('Creating branch', { name: dto.name });
    const { mediaIds, operatingHours, ...branchData } = dto;

    const branch = this.branchRepo.create(branchData);
    const savedBranch = await this.branchRepo.save(branch);
    this.logger.log('Branch created successfully', {
      branchId: savedBranch.id,
    });

    // Link media to branch
    if (mediaIds && mediaIds.length > 0) {
      await this.mediaRepo.update(
        { id: In(mediaIds) },
        { branch: savedBranch },
      );
    }

    // Create operating hours
    if (operatingHours && operatingHours.length > 0) {
      const hoursToCreate = operatingHours.map((hour) =>
        this.operatingHoursRepo.create({
          ...hour,
          branch: savedBranch,
        }),
      );
      await this.operatingHoursRepo.save(hoursToCreate);
    }

    // link branch with staff

    return this.branchRepo.findOne({
      where: { id: savedBranch.id },
      relations: ['spa', 'media', 'operatingHours'],
    });
  }

  async findAll(ids: Array<string>): Promise<Branch[]> {
    return this.branchRepo.find({
      relations: ['spa', 'operatingHours', 'media'],
      where: {
        id: In(ids),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['spa', 'media', 'operatingHours'],
    });
    if (!branch) {
      this.logger.error('Branch not found', null, { branchId: id });
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async findBySpaId(spaId: string): Promise<Branch[]> {
    return this.branchRepo.find({
      where: { spa: { id: spaId } },
      relations: ['spa', 'operatingHours', 'media'],
      order: { createdAt: 'DESC' },
    });
  }

  async findLocationBySpaId(spaId: string): Promise<{ location: string }[]> {
    const branches = await this.branchRepo.find({
      where: { spa: { id: spaId } },
      select: ['location'],
      order: { location: 'ASC' },
    });
    // Get unique locations only
    const uniqueLocations = Array.from(
      new Set(branches.map((branch) => branch.location)),
    );
    return uniqueLocations.map((location) => ({ location }));
  }

  async findBranchByLocation(
    spaId: string,
    location: string,
  ): Promise<Branch[]> {
    return this.branchRepo.find({
      where: {
        spa: { id: spaId },
        location: location === 'all' ? undefined : location,
      },
      relations: ['spa', 'operatingHours', 'media'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    this.logger.log('Updating branch', { branchId: id });
    const { mediaIds, operatingHours, ...branchData } = dto;

    const branch = await this.findOne(id);
    Object.assign(branch, branchData);
    await this.branchRepo.save(branch);

    // Link media to branch
    if (mediaIds !== undefined) {
      // First, unlink old media
      await this.mediaRepo.update({ branch: { id } }, { branch: null });

      // Link new media
      if (mediaIds.length > 0) {
        await this.mediaRepo.update({ id: In(mediaIds) }, { branch });
      }
    }

    // Update operating hours
    if (operatingHours !== undefined) {
      // Delete old operating hours
      await this.operatingHoursRepo.delete({ branch: { id } });

      // Create new operating hours
      if (operatingHours.length > 0) {
        const hoursToCreate = operatingHours.map((hour) =>
          this.operatingHoursRepo.create({
            ...hour,
            branch,
          }),
        );
        await this.operatingHoursRepo.save(hoursToCreate);
      }
    }

    const updated = await this.branchRepo.findOne({
      where: { id },
      relations: ['spa', 'media', 'operatingHours'],
    });
    this.logger.log('Branch updated successfully', { branchId: id });
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.logger.log('Deleting branch', { branchId: id });
    await this.branchRepo.softDelete(id);
    this.logger.log('Branch deleted successfully', { branchId: id });
  }
}
