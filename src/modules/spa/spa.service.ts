import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Spa } from 'src/entities/spa.entity';
import { Repository } from 'typeorm';
import { encryptApiKey } from '../../shared/crypto.util';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

@Injectable()
export class SpaService {
  constructor(
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('SpaService');
  }

  async create(data: Partial<Spa> | Record<string, unknown>): Promise<Spa> {
    this.logger.log('Creating spa');
    const rawApiKey =
      typeof (data as any).apiKey === 'string'
        ? (data as any).apiKey
        : typeof (data as any)['api_key'] === 'string'
          ? (data as any)['api_key']
          : undefined;

    const payload: Partial<Spa> = { ...(data as Partial<Spa>) };
    if (rawApiKey) {
      payload.apiKey = encryptApiKey(rawApiKey);
    }

    const entity = this.spaRepo.create(payload);
    const savedSpa = await this.spaRepo.save(entity);
    this.logger.log('Spa created successfully', { spaId: savedSpa.id });
    return savedSpa;
  }

  async findAll(): Promise<Spa[]> {
    return this.spaRepo.find();
  }

  async findOne(id: string): Promise<Spa> {
    const spa = await this.spaRepo.findOne({ where: { id } });
    if (!spa) {
      this.logger.error('Spa not found', null, { spaId: id });
      throw new NotFoundException('Spa not found');
    }
    return spa;
  }

  async update(
    id: string,
    data: Partial<Spa> | Record<string, unknown>,
  ): Promise<Spa> {
    this.logger.log('Updating spa', { spaId: id });
    const spa = await this.findOne(id);
    const rawApiKey =
      typeof (data as any).apiKey === 'string'
        ? (data as any).apiKey
        : typeof (data as any)['api_key'] === 'string'
          ? (data as any)['api_key']
          : undefined;

    const payload: Partial<Spa> = { ...(data as Partial<Spa>) };
    if (rawApiKey) payload.apiKey = encryptApiKey(rawApiKey);

    Object.assign(spa, payload);
    const updatedSpa = await this.spaRepo.save(spa);
    this.logger.log('Spa updated successfully', { spaId: id });
    return updatedSpa;
  }

  async remove(id: string): Promise<void> {
    this.logger.log('Deleting spa', { spaId: id });
    const spa = await this.findOne(id);
    await this.spaRepo.remove(spa);
    this.logger.log('Spa deleted successfully', { spaId: id });
  }

  async findByCompanyId(companyId: string): Promise<Spa[]> {
    return this.spaRepo.find({ where: { companyId: companyId } });
  }
}
