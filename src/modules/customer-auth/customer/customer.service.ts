import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customers.entity';
import { Spa } from 'src/entities/spa.entity';
import { Repository, EntityManager, In } from 'typeorm';
import { hashPassword } from 'src/shared/password.util';
import {
  paginate,
  getPaginationQueryTypeORM,
} from 'src/shared/pagination.util';
import { PaginationParams } from 'src/shared/pagination.types';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('CustomerService');
  }

  async create(data: Partial<Customer>, entityManager?: EntityManager) {
    this.logger.log('Creating customer', { email: data.email });
    const repo = entityManager
      ? entityManager.getRepository(Customer)
      : this.repo;
    const savedCustomer = await repo.save(repo.create(data));
    this.logger.log('Customer created successfully', {
      customerId: savedCustomer.id,
    });
    return savedCustomer;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, relations: ['spa'] });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['spa'] });
  }

  async update(
    id: string,
    data: Partial<Customer> | UpdateCustomerDto,
    entityManager?: EntityManager,
    actorId?: string,
    actorName?: string,
  ) {
    const repo = entityManager
      ? entityManager.getRepository(Customer)
      : this.repo;

    // Get old data for audit trail
    const oldCustomer = await repo.findOne({ where: { id } });

    // Hash password if it's being updated
    if ('password' in data && data.password) {
      const updateData = data as any;
      updateData.password = await hashPassword(data.password);
      await repo.update(id, updateData);
    } else {
      await repo.update(id, data);
    }

    const updatedCustomer = await repo.findOne({
      where: { id },
      relations: ['spa'],
    });

    return updatedCustomer;
  }

  async delete(id: string, actorId?: string, actorName?: string) {
    this.logger.log('Deleting customer', { customerId: id });

    // Get customer data before deletion for audit trail
    const customer = await this.repo.findOne({ where: { id } });

    const result = await this.repo.softDelete(id);

    this.logger.log('Customer deleted successfully', { customerId: id });
    return result;
  }

  async findAll() {
    return this.repo.find({ relations: ['spa'] });
  }

  async list(
    paginationParams: PaginationParams,
    spaId?: string,
    filters?: { search?: string },
  ) {
    const { skip, take } = getPaginationQueryTypeORM(paginationParams);

    const query = this.repo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.spa', 'spa');

    // Filter by spa if spaId provided
    if (spaId) {
      query.where('spa.id = :spaId', { spaId });
    }

    // Search filter for firstName, lastName, or email
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search)',
        { search: searchTerm },
      );
    }

    const [results, totalCount] = await query
      .skip(skip)
      .take(take)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    return paginate(paginationParams, totalCount, results);
  }

  async getById(id: string) {
    const customer = await this.repo.findOne({
      where: { id },
      relations: ['spa', 'bookings', 'guests'],
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async createWithSpa(
    dto: CreateCustomerDto,
    spaIds?: string[],
    actorId?: string,
    actorName?: string,
  ) {
    // Check if customer already exists
    const existingCustomer = await this.repo.findOne({
      where: { email: dto.email },
    });

    if (existingCustomer) {
      throw new BadRequestException('Customer with this email already exists');
    }

    // Get the first spa from user's spa IDs
    if (!spaIds || spaIds.length === 0) {
      throw new BadRequestException('No spa assigned to user');
    }

    const spa = await this.spaRepo.findOne({
      where: { id: spaIds[0] },
    });

    if (!spa) {
      throw new NotFoundException('Spa not found');
    }

    const hashedPassword = await hashPassword(dto.password);

    const customer = this.repo.create({
      ...dto,
      password: hashedPassword,
      spa,
      isVerified: true, // Admin can create verified customers
    });

    const savedCustomer = await this.repo.save(customer);

    return savedCustomer;
  }
}
