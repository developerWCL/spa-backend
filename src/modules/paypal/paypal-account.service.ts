import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PaypalAccount } from 'src/entities/paypal_account.entity';
import { Branch } from 'src/entities/branch.entity';
import { Spa } from 'src/entities/spa.entity';
import { encryptApiKey, decryptApiKey } from 'src/shared/crypto.util';
import {
  CreatePaypalAccountDto,
  UpdatePaypalAccountDto,
} from './paypal.dto';

@Injectable()
export class PaypalAccountService {
  constructor(
    @InjectRepository(PaypalAccount)
    private readonly repo: Repository<PaypalAccount>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
  ) {}

  async create(dto: CreatePaypalAccountDto): Promise<PaypalAccount> {
    const spa = await this.spaRepo.findOneBy({ id: dto.spaId });
    if (!spa) throw new NotFoundException('Spa not found');

    const account = this.repo.create({
      spa,
      label: dto.label,
      clientId: encryptApiKey(dto.clientId),
      clientSecret: encryptApiKey(dto.clientSecret),
      webhookId: dto.webhookId ?? null,
      mode: dto.mode,
    });

    const saved = await this.repo.save(account);

    if (dto.branchIds?.length) {
      await this.assignBranches(saved.id, dto.branchIds);
    }

    return this.findOne(saved.id);
  }

  async findAllBySpa(spaId: string): Promise<any[]> {
    const accounts = await this.repo.find({
      where: { spa: { id: spaId } },
      relations: ['branches', 'spa'],
      order: { createdAt: 'DESC' },
    });

    return accounts.map((a) => this.maskAccount(a));
  }

  async findOne(id: string): Promise<any> {
    const account = await this.repo.findOne({
      where: { id },
      relations: ['branches', 'spa'],
    });
    if (!account) throw new NotFoundException('PayPal account not found');
    return this.maskAccount(account);
  }

  async update(id: string, dto: UpdatePaypalAccountDto): Promise<any> {
    const account = await this.repo.findOne({
      where: { id },
      relations: ['branches', 'spa'],
    });
    if (!account) throw new NotFoundException('PayPal account not found');

    if (dto.label !== undefined) account.label = dto.label;
    if (dto.webhookId !== undefined) account.webhookId = dto.webhookId;
    if (dto.mode !== undefined) account.mode = dto.mode;
    if (dto.isActive !== undefined) account.isActive = dto.isActive;

    if (dto.clientId) {
      account.clientId = encryptApiKey(dto.clientId);
    }
    if (dto.clientSecret) {
      account.clientSecret = encryptApiKey(dto.clientSecret);
    }

    await this.repo.save(account);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const account = await this.repo.findOneBy({ id });
    if (!account) throw new NotFoundException('PayPal account not found');
    await this.repo.softDelete(id);
  }

  async assignBranches(accountId: string, branchIds: string[]): Promise<any> {
    const account = await this.repo.findOne({
      where: { id: accountId },
      relations: ['branches', 'spa'],
    });
    if (!account) throw new NotFoundException('PayPal account not found');

    const branches = await this.branchRepo.findBy({ id: In(branchIds) });
    if (branches.length !== branchIds.length) {
      throw new BadRequestException('One or more branch IDs are invalid');
    }

    account.branches = branches;
    await this.repo.save(account);
    return this.findOne(accountId);
  }

  /**
   * Get decrypted credentials for a branch.
   * Used internally by PaypalService — never exposed to API responses.
   */
  async getAccountForBranch(
    branchId: string,
  ): Promise<{
    clientId: string;
    clientSecret: string;
    webhookId: string | null;
    mode: string;
  }> {
    const account = await this.repo
      .createQueryBuilder('pa')
      .innerJoin('pa.branches', 'b', 'b.id = :branchId', { branchId })
      .where('pa.is_active = true')
      .andWhere('pa.deleted_at IS NULL')
      .getOne();

    if (!account) {
      throw new NotFoundException(
        `No active PayPal account found for branch ${branchId}`,
      );
    }

    return {
      clientId: decryptApiKey(account.clientId),
      clientSecret: decryptApiKey(account.clientSecret),
      webhookId: account.webhookId,
      mode: account.mode,
    };
  }

  /**
   * Try to obtain a PayPal access token to verify credentials work.
   */
  async testConnection(id: string): Promise<{ success: boolean; error?: string }> {
    const account = await this.repo.findOneBy({ id });
    if (!account) throw new NotFoundException('PayPal account not found');

    const clientId = decryptApiKey(account.clientId);
    const clientSecret = decryptApiKey(account.clientSecret);

    const baseUrl =
      account.mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const axios = require('axios');
    try {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );
      await axios.post(`${baseUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err?.response?.data?.error_description ?? 'Connection failed',
      };
    }
  }

  private maskAccount(account: PaypalAccount): any {
    const decryptedClientId = decryptApiKey(account.clientId);
    return {
      id: account.id,
      label: account.label,
      clientId: '...' + decryptedClientId.slice(-4),
      webhookId: account.webhookId,
      mode: account.mode,
      isActive: account.isActive,
      branches: account.branches ?? [],
      spaId: account.spa?.id,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
