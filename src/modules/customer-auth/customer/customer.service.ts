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

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
  ) {}

  async create(data: Partial<Customer>, entityManager?: EntityManager) {
    const repo = entityManager
      ? entityManager.getRepository(Customer)
      : this.repo;
    return repo.save(repo.create(data));
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
  ) {
    const repo = entityManager
      ? entityManager.getRepository(Customer)
      : this.repo;

    // Hash password if it's being updated
    if ('password' in data && data.password) {
      const updateData = data as any;
      updateData.password = await hashPassword(data.password);
      await repo.update(id, updateData);
    } else {
      await repo.update(id, data);
    }

    return repo.findOne({ where: { id }, relations: ['spa'] });
  }

  async delete(id: string) {
    return this.repo.softDelete(id);
  }

  async findAll() {
    return this.repo.find({ relations: ['spa'] });
  }

  async list(
    paginationParams: PaginationParams,
    spaIds?: string[],
    filters?: { search?: string },
  ) {
    const { skip, take } = getPaginationQueryTypeORM(paginationParams);

    const query = this.repo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.spa', 'spa');

    // Filter by spa if spaIds provided
    if (spaIds && spaIds.length > 0) {
      query.where('spa.id IN (:...spaIds)', { spaIds });
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

  async createWithSpa(dto: CreateCustomerDto, spaIds?: string[]) {
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

    return this.repo.save(customer);
  }
}
