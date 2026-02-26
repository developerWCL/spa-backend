import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Branch } from 'src/entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto } from './branches.types';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  async findAll(ids: Array<string>): Promise<Branch[]> {
    return this.branchRepo.find({
      relations: ['spa'],
      where: {
        id: In(ids),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepo.findOne({
      where: { id },
      relations: ['spa'],
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async findBySpaId(spaId: string): Promise<Branch[]> {
    return this.branchRepo.find({
      where: { spa: { id: spaId } },
      relations: ['spa'],
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
      relations: ['spa', 'operatingHours'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, dto);
    return this.branchRepo.save(branch);
  }

  async remove(id: string): Promise<void> {
    await this.branchRepo.softDelete(id);
  }
}
