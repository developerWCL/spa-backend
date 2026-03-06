import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Raw } from 'typeorm';
import { Guest } from 'src/entities/guests.entity';
import { Customer } from 'src/entities/customers.entity';
import { Spa } from 'src/entities/spa.entity';
import { CreateGuestDto, UpdateGuestDto } from './guests.types';
import { paginate } from 'src/shared/pagination.util';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { EntityGuestGender } from 'src/entities/enums/entity-guest.enum';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepo: Repository<Guest>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Spa)
    private readonly spaRepo: Repository<Spa>,
  ) {}

  async create(dto: CreateGuestDto): Promise<Guest> {
    // Check if spa exists
    let spa: Spa | null = null;
    if (dto.spaId) {
      spa = await this.spaRepo.findOne({
        where: { id: dto.spaId },
      });
      if (!spa) {
        throw new NotFoundException('Spa not found');
      }
    }

    // Check if customer exists (optional)
    let customer: Customer | null = null;
    if (dto.customerId) {
      customer = await this.customerRepo.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    const guest = this.guestRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone || null,
      nationality: dto.nationality || null,
      gender: dto.gender || EntityGuestGender.MALE,
      spa: spa || undefined,
      customer: customer || null,
    });

    return this.guestRepo.save(guest);
  }

  async findAll(
    page?: number,
    limit?: number,
    customerId?: string,
    search?: string,
    spaId?: string,
  ): Promise<PaginatedResponse<Guest> | Guest[]> {
    const where: FindOptionsWhere<Guest> = {
      spa: { id: spaId || '' },
    };

    // Filter by customer ID if provided
    if (customerId) {
      where.customer = { id: customerId };
    }

    // Add search filter (case-insensitive) - search in first name, last name, or email
    if (search) {
      where.firstName = Raw((alias) => `LOWER(${alias}) LIKE :search`, {
        search: `%${search.toLowerCase()}%`,
      });
    }

    // If page and limit are not provided, return all guests
    if (!page || !limit) {
      const guests = await this.guestRepo.find({
        where,
        relations: ['spa', 'customer'],
        order: { createdAt: 'DESC' },
      });
      return guests;
    }

    const skip = (page - 1) * limit;

    const [guests, total] = await this.guestRepo.findAndCount({
      where,
      relations: ['spa', 'customer'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return paginate({ page, limit }, total, guests);
  }

  async findOne(id: string): Promise<Guest> {
    const guest = await this.guestRepo.findOne({
      where: { id },
      relations: ['spa', 'customer', 'bookings'],
    });
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }
    return guest;
  }

  async update(id: string, dto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.guestRepo.findOne({
      where: { id },
    });
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    // Check if customer exists (if updating customer)
    if (dto.customerId) {
      const customer = await this.customerRepo.findOne({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      guest.customer = customer;
    }

    // Update fields
    if (dto.firstName) guest.firstName = dto.firstName;
    if (dto.lastName) guest.lastName = dto.lastName;
    if (dto.email) guest.email = dto.email;
    if (dto.phone !== undefined) guest.phone = dto.phone;
    if (dto.nationality !== undefined) guest.nationality = dto.nationality;
    if (dto.gender) guest.gender = dto.gender;

    return this.guestRepo.save(guest);
  }

  async remove(id: string): Promise<{ message: string }> {
    const guest = await this.guestRepo.findOne({
      where: { id },
    });
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    await this.guestRepo.softDelete(id);
    return { message: 'Guest deleted successfully' };
  }
}
