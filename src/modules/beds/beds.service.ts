import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Raw } from 'typeorm';
import { Bed } from 'src/entities/beds.entity';
import { CreateBedDto, UpdateBedDto } from './beds.types';
import { paginate } from 'src/shared/pagination.util';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { RoomStatus } from 'src/entities/enums/entity-room.enum';
import { Room } from 'src/entities/rooms.entity';

@Injectable()
export class BedsService {
  constructor(
    @InjectRepository(Bed)
    private readonly bedRepo: Repository<Bed>,
  ) {}

  async create(dto: CreateBedDto): Promise<Bed> {
    // Check if room exists
    const room = await this.bedRepo.manager.findOne('Room', {
      where: { id: dto.roomId },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if branch exists
    const branch = await this.bedRepo.manager.findOne('Branch', {
      where: { id: dto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const bed = this.bedRepo.create({
      ...dto,
      room,
      branch,
    });
    return this.bedRepo.save(bed);
  }

  async findAll(
    branchId: string,
    userBranchIds: string[],
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<Bed>> {
    if (!userBranchIds.includes(branchId)) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const where: FindOptionsWhere<Bed> = {
      branch: { id: branchId },
    };

    // Add search filter (case-insensitive)
    if (search) {
      where.name = Raw((alias) => `LOWER(${alias}) LIKE :search`, {
        search: `%${search.toLowerCase()}%`,
      });
    }

    // Add status filter
    if (status) {
      where.status = status as RoomStatus;
    }

    const skip = (page - 1) * limit;

    const [beds, total] = await this.bedRepo.findAndCount({
      where,
      relations: ['room', 'room.branch'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });
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
    const bed = await this.findOne(id);
    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    // If roomId is being updated, check if the new room exists
    if (dto.roomId && dto.roomId !== bed?.room?.id && dto.roomId !== 'none') {
      const room = await this.bedRepo.manager.findOne('Room', {
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }
      bed.room = room as Room;
    }
    if (dto.roomId === 'none') {
      bed.room = null;
    }

    Object.assign(bed, dto);
    return this.bedRepo.save(bed);
  }

  async remove(id: string): Promise<void> {
    const bed = await this.findOne(id);
    await this.bedRepo.softDelete(bed.id);
  }
}
