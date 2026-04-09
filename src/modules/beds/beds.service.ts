import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from 'src/entities/beds.entity';
import { CreateBedDto, UpdateBedDto } from './beds.types';
import { paginate } from 'src/shared/pagination.util';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { RoomStatus } from 'src/entities/enums/entity-room.enum';
import { Room } from 'src/entities/rooms.entity';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

@Injectable()
export class BedsService {
  constructor(
    @InjectRepository(Bed)
    private readonly bedRepo: Repository<Bed>,
    private logger: AppLoggerService,
  ) {
    this.logger.setContext('BedsService');
  }

  async create(dto: CreateBedDto): Promise<Bed> {
    this.logger.log('Creating bed', {
      bedName: dto.name,
      roomId: dto.roomId,
      branchId: dto.branchId,
    });
    // Check if room exists
    const room = await this.bedRepo.manager.findOne('Room', {
      where: { id: dto.roomId },
    });
    if (!room) {
      this.logger.error('Room not found', null, { roomId: dto.roomId });
      throw new NotFoundException('Room not found');
    }

    // Check if branch exists
    const branch = await this.bedRepo.manager.findOne('Branch', {
      where: { id: dto.branchId },
    });
    if (!branch) {
      this.logger.error('Branch not found', null, { branchId: dto.branchId });
      throw new NotFoundException('Branch not found');
    }

    const bed = this.bedRepo.create({
      ...dto,
      room,
      branch,
    });
    const savedBed = await this.bedRepo.save(bed);
    this.logger.log('Bed created successfully', {
      bedId: savedBed.id,
      bedName: savedBed.name,
    });
    return savedBed;
  }

  async findAll(
    branchId: string,
    userBranchIds: string[],
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    date?: string,
  ): Promise<PaginatedResponse<Bed>> {
    if (!userBranchIds.includes(branchId)) {
      throw new ForbiddenException('Access denied to this branch');
    }
    console.log('date', date);

    // Validate date format if provided
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    const skip = (page - 1) * limit;

    // Build the base query using QueryBuilder
    let query = this.bedRepo
      .createQueryBuilder('bed')
      .leftJoinAndSelect('bed.room', 'room')
      .leftJoinAndSelect('room.branch', 'branch')
      .where('bed.branchId = :branchId', { branchId })
      .orderBy('bed.createdAt', 'DESC');

    // Add search filter
    if (search) {
      query = query.andWhere('bed.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // Add status filter
    if (status) {
      query = query.andWhere('bed.status = :status', {
        status: status as RoomStatus,
      });
    }

    // Add date filter - exclude beds whose rooms have closures on the specified date
    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
      );
      const endOfDay = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate() + 1,
      );

      // Find beds whose rooms have closures on the date
      const subquery = this.bedRepo
        .createQueryBuilder('closureBed')
        .select('closureBed.id')
        .leftJoin('closureBed.room', 'closureRoom')
        .leftJoin('closureRoom.closure', 'roomClosure')
        .leftJoin('closureBed.closure', 'closure')
        .where(
          'closure.closureDate >= :startOfDay AND closure.closureDate < :endOfDay',
          { startOfDay, endOfDay },
        )
        .andWhere('closure.deletedAt IS NULL');

      query = query.andWhere(`bed.id NOT IN (${subquery.getQuery()})`, {
        startOfDay,
        endOfDay,
      });
    }

    const [beds, total] = await query.take(limit).skip(skip).getManyAndCount();
    console.log(beds);

    // Return beds with full room and branch data
    return paginate({ page, limit }, total, beds);
  }

  async findOne(id: string): Promise<Bed> {
    const bed = await this.bedRepo.findOne({
      where: { id },
      relations: ['room', 'room.branch'],
    });
    if (!bed) {
      this.logger.warn('Bed not found', { bedId: id });
      throw new NotFoundException('Bed not found');
    }
    return bed;
  }

  async findByRoomId(roomId: string): Promise<Bed[]> {
    const beds = await this.bedRepo.find({
      where: { room: { id: roomId } },
      relations: ['room', 'room.branch'],
      order: { createdAt: 'DESC' },
    });
    // Optionally, you can add roomId and branchId as extra properties (not as part of Bed type)
    // If you want to keep the return type as Bed[], just return beds;
    // If you want to add extra properties, define a new type or use a DTO.
    return beds;
  }

  async update(id: string, dto: UpdateBedDto): Promise<Bed> {
    this.logger.log('Updating bed', { bedId: id });
    const bed = await this.findOne(id);
    if (!bed) {
      this.logger.error('Bed not found for update', null, { bedId: id });
      throw new NotFoundException('Bed not found');
    }

    // If roomId is being updated, check if the new room exists
    if (dto.roomId && dto.roomId !== bed?.room?.id && dto.roomId !== 'none') {
      const room = await this.bedRepo.manager.findOne('Room', {
        where: { id: dto.roomId },
      });
      if (!room) {
        this.logger.error('Room not found for bed update', null, {
          roomId: dto.roomId,
        });
        throw new NotFoundException('Room not found');
      }
      bed.room = room as Room;
    }
    if (dto.roomId === 'none') {
      bed.room = null;
    }

    Object.assign(bed, dto);
    const updatedBed = await this.bedRepo.save(bed);
    this.logger.log('Bed updated successfully', { bedId: id });
    return updatedBed;
  }

  async remove(id: string): Promise<void> {
    this.logger.log('Deleting bed', { bedId: id });
    const bed = await this.findOne(id);
    await this.bedRepo.softDelete(bed.id);
    this.logger.log('Bed deleted successfully', { bedId: id });
  }
}
