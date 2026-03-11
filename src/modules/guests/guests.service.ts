import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      specialRequest: dto.specialRequest || null,
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
    let query = this.guestRepo.createQueryBuilder('guest');

    // Filter by spa
    if (spaId) {
      query = query.innerJoinAndSelect('guest.spa', 'spa', 'spa.id = :spaId', {
        spaId,
      });
    } else {
      query = query.leftJoinAndSelect('guest.spa', 'spa');
    }

    // Filter by customer ID if provided
    if (customerId) {
      query = query.innerJoinAndSelect(
        'guest.customer',
        'customer',
        'customer.id = :customerId',
        { customerId },
      );
    } else {
      query = query.leftJoinAndSelect('guest.customer', 'customer');
    }

    // Load booking items for each guest
    query = query.leftJoinAndSelect('guest.bookingItems', 'bookingItems');

    // Add search filter (case-insensitive) - search in first name, last name, email, or phone
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      query = query.where(
        `LOWER(guest.firstName) LIKE :search 
         OR LOWER(guest.lastName) LIKE :search 
         OR LOWER(guest.email) LIKE :search 
         OR LOWER(guest.phone) LIKE :search`,
        { search: searchParam },
      );
    }

    query = query.orderBy('guest.createdAt', 'DESC');

    // If page and limit are not provided, return all guests
    if (!page || !limit) {
      const guests = await query.getMany();
      return guests;
    }

    const skip = (page - 1) * limit;
    query = query.take(limit).skip(skip);

    const [guests, total] = await query.getManyAndCount();

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
    if (dto.specialRequest !== undefined)
      guest.specialRequest = dto.specialRequest;

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
