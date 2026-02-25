import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customers.entity';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
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
    data: Partial<Customer>,
    entityManager?: EntityManager,
  ) {
    const repo = entityManager
      ? entityManager.getRepository(Customer)
      : this.repo;
    await repo.update(id, data);
    return repo.findOne({ where: { id }, relations: ['spa'] });
  }

  async delete(id: string) {
    return this.repo.softDelete(id);
  }

  async findAll() {
    return this.repo.find({ relations: ['spa'] });
  }
}
