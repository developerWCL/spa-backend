import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Spa } from 'src/entities/spa.entity';
import { Repository } from 'typeorm';
import { encryptApiKey } from '../../shared/crypto.util';

@Injectable()
export class SpaService {
  constructor(
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
  ) {}

  async create(data: Partial<Spa> | Record<string, unknown>): Promise<Spa> {
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

  async update(
    id: string,
    data: Partial<Spa> | Record<string, unknown>,
  ): Promise<Spa> {
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
    return this.spaRepo.save(spa);
  }

  async remove(id: string): Promise<void> {
    const spa = await this.findOne(id);
    await this.spaRepo.remove(spa);
  }

  async findByCompanyId(companyId: string): Promise<Spa[]> {
    return this.spaRepo.find({ where: { companyId: companyId } });
  }
}
