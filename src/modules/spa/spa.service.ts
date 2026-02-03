import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Spa } from 'src/entities/spa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpaService {
  constructor(
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
  ) {}

  async create(data: Partial<Spa>): Promise<Spa> {
    const entity = this.spaRepo.create(data);
    return this.spaRepo.save(entity);
  }

  async findAll(): Promise<Spa[]> {
    return this.spaRepo.find();
  }

  async findOne(id: string): Promise<Spa> {
    const spa = await this.spaRepo.findOne({ where: { id } });
    if (!spa) throw new NotFoundException('Spa not found');
    return spa;
  }

  async update(id: string, data: Partial<Spa>): Promise<Spa> {
    const spa = await this.findOne(id);
    Object.assign(spa, data);
    return this.spaRepo.save(spa);
  }

  async remove(id: string): Promise<void> {
    const spa = await this.findOne(id);
    await this.spaRepo.remove(spa);
  }

  async findByCompanyId(companyId: string): Promise<Spa[]> {
    return this.spaRepo.find({ where: { company_id: companyId } });
  }
}
