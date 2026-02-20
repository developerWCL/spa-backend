import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, Raw } from 'typeorm';
import { Booking } from '../../entities/bookings.entity';
import { CreateBookingDto, UpdateBookingDto } from './booking.dto';
import {
  paginate,
  getPaginationQueryTypeORM,
} from '../../shared/pagination.util';
import {
  PaginationParams,
  PaginatedResponse,
} from '../../shared/pagination.types';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create(data);
    return this.bookingRepository.save(booking);
  }

  async findAll(
    branchId: string,
    params: PaginationParams = {},
    date?: string,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<Booking>> {
    const where: any = { branch: { id: branchId } };
    // fileter by date if provided
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.bookingTime = Between(start, end);
    } else {
      // default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      where.bookingTime = Between(today, end);
    }
    // Build advanced where for search and status
    let advancedWhere: any[] = [];
    if (search) {
      const searchLower = search.toLowerCase();
      advancedWhere.push(
        {
          ...where,
          bed: {
            name: Raw((alias) => `LOWER(${alias}) LIKE :search`, {
              search: `%${searchLower}%`,
            }),
          },
        },
        {
          ...where,
          bed: {
            room: {
              name: Raw((alias) => `LOWER(${alias}) LIKE :search`, {
                search: `%${searchLower}%`,
              }),
            },
          },
        },
      );
    }

    if (status && status !== 'all') {
      advancedWhere = advancedWhere.length
        ? advancedWhere.map((w) => ({ ...w, bed: { ...w.bed, status } }))
        : [
            { ...where, bed: { status } },
            { ...where, bed: { room: { status } } },
          ];
    }
    const { skip, take } = getPaginationQueryTypeORM(params);
    const [data, total] = await this.bookingRepository.findAndCount({
      where: advancedWhere.length ? advancedWhere : where,
      relations: [
        'customer',
        'subService',
        'subService.service',
        'package',
        'package.subServices',
        'package.subServices.service',
        'programme',
        'programme.steps',
        'bed',
        'promotion',
        'bed.room',
      ],
      skip,
      take,
    });
    return paginate(params, total, data);
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    await this.bookingRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bookingRepository.softDelete(id);
  }
}
