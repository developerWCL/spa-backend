import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Room } from 'src/entities/rooms.entity';
import { Branch } from 'src/entities/branch.entity';
import { CreateRoomDto, UpdateRoomDto } from './rooms.types';
import { paginate } from 'src/shared/pagination.util';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { RoomStatus } from 'src/entities/enums/entity-room.enum';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(dto: CreateRoomDto): Promise<Room> {
    const { branchId, ...roomData } = dto;

    // Verify branch exists
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const room = this.roomRepo.create({
      ...roomData,
      branch,
    });
    return this.roomRepo.save(room);
  }

  async findAll(
    branchId: string,
    userBranchIds: string[],
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<Room>> {
    if (!userBranchIds.includes(branchId)) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const where: FindOptionsWhere<Room> = {
      branch: { id: branchId },
    };

    // Add search filter
    if (search) {
      where.name = Like(`%${search}%`);
    }

    // Add status filter
    if (status) {
      where.status = status as RoomStatus;
    }

    const skip = (page - 1) * limit;

    const [rooms, total] = await this.roomRepo.findAndCount({
      where,
      relations: ['branch', 'beds'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });
    return paginate({ page, limit }, total, rooms);
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: ['branch', 'beds'],
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async findByBranchId(branchId: string): Promise<Room[]> {
    return this.roomRepo.find({
      where: { branch: { id: branchId } },
      relations: ['branch', 'beds'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    Object.assign(room, dto);
    return this.roomRepo.save(room);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepo.softDelete(room.id);
  }
}
