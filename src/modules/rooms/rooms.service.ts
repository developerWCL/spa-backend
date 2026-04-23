import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from 'src/entities/rooms.entity';
import { Branch } from 'src/entities/branch.entity';
import { CreateRoomDto, UpdateRoomDto } from './rooms.types';
import { paginate } from 'src/shared/pagination.util';
import { PaginatedResponse } from 'src/shared/pagination.types';
import { RoomStatus } from 'src/entities/enums/entity-room.enum';
import { AppLoggerService } from 'src/core/logging/app-logger.service';
import { ActionLogService } from 'src/core/logging/action-log.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly logger: AppLoggerService,
    private readonly actionLogService: ActionLogService,
  ) {
    this.logger.setContext('RoomsService');
  }

  async create(
    dto: CreateRoomDto,
    actorId?: string,
    actorName?: string,
  ): Promise<Room> {
    this.logger.log('Creating room', {
      name: dto.name,
      branchId: dto.branchId,
    });
    const { branchId, ...roomData } = dto;

    // Verify branch exists
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      this.logger.error('Branch not found', null, { branchId });
      throw new BadRequestException('Branch not found');
    }

    const room = this.roomRepo.create({
      ...roomData,
      branch,
    });
    const savedRoom = await this.roomRepo.save(room);
    this.logger.log('Room created successfully', { roomId: savedRoom.id });

    // Log action to database
    if (actorId) {
      await this.actionLogService.logAction({
        actionType: 'create',
        feature: 'room',
        subFeature: null,
        actorId,
        actorName: actorName || null,
        branchId: branchId,
        newData: {
          id: savedRoom.id,
          name: savedRoom.name,
          status: savedRoom.status,
          branchId: branchId,
        },
        entityType: 'room',
        entityId: savedRoom.id,
        description: `Created room: ${savedRoom.name}`,
        status: 'success',
      });
    }

    return savedRoom;
  }

  async findAll(
    branchId: string,
    userBranchIds: string[],
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    date?: string,
  ): Promise<PaginatedResponse<Room>> {
    if (!userBranchIds.includes(branchId)) {
      throw new ForbiddenException('Access denied to this branch');
    }

    // Validate date format if provided
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    const skip = (page - 1) * limit;

    // Build the base query
    let query = this.roomRepo
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.branch', 'branch')
      .leftJoinAndSelect('room.beds', 'beds')
      .leftJoinAndSelect('room.closure', 'closure')
      .where('room.branchId = :branchId', { branchId })
      .orderBy('room.createdAt', 'DESC');

    // Add search filter
    if (search) {
      query = query.andWhere('room.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    // Add status filter
    if (status) {
      query = query.andWhere('room.status = :status', {
        status: status as RoomStatus,
      });
    }

    // Add date filter - exclude rooms that have closures on the specified date
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

      // Use a subquery with QueryBuilder to find rooms without closures on the date
      const subquery = this.roomRepo
        .createQueryBuilder('closureRoom')
        .select('closureRoom.id')
        .leftJoin('closureRoom.closure', 'roomClosure')
        .where(
          'roomClosure.closureDate >= :startOfDay AND roomClosure.closureDate < :endOfDay AND roomClosure.bedId IS NULL',
          { startOfDay, endOfDay },
        )
        .andWhere('roomClosure.deletedAt IS NULL');

      query = query.andWhere(`room.id NOT IN (${subquery.getQuery()})`, {
        startOfDay,
        endOfDay,
      });
    }

    const [rooms, total] = await query.take(limit).skip(skip).getManyAndCount();
    return paginate({ page, limit }, total, rooms);
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: ['branch', 'beds'],
    });
    if (!room) {
      this.logger.error('Room not found', null, { roomId: id });
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

  async update(
    id: string,
    dto: UpdateRoomDto,
    actorId?: string,
    actorName?: string,
  ): Promise<Room> {
    this.logger.log('Updating room', { roomId: id });
    const room = await this.findOne(id);

    // Capture old data before update
    const oldData = {
      id: room.id,
      name: room.name,
      status: room.status,
      branchId: room.branch.id,
    };

    Object.assign(room, dto);
    const updatedRoom = await this.roomRepo.save(room);
    this.logger.log('Room updated successfully', { roomId: id });

    // Log action to database
    if (actorId) {
      await this.actionLogService.logAction({
        actionType: 'update',
        feature: 'room',
        subFeature: null,
        actorId,
        actorName: actorName || null,
        branchId: room.branch.id,
        oldData,
        newData: {
          id: updatedRoom.id,
          name: updatedRoom.name,
          status: updatedRoom.status,
          branchId: room.branch.id,
        },
        entityType: 'room',
        entityId: updatedRoom.id,
        description: `Updated room: ${updatedRoom.name}`,
        status: 'success',
      });
    }

    return updatedRoom;
  }

  async remove(
    id: string,
    actorId?: string,
    actorName?: string,
  ): Promise<void> {
    this.logger.log('Deleting room', { roomId: id });
    const room = await this.findOne(id);
    if (!room) {
      this.logger.error('Room not found', null, { roomId: id });
      throw new NotFoundException('Room not found');
    }

    // Capture data before deletion
    const deletedData = {
      id: room.id,
      name: room.name,
      status: room.status,
      branchId: room.branch.id,
    };

    await this.roomRepo.softDelete(room.id);
    this.logger.log('Room deleted successfully', { roomId: id });

    // Log action to database
    if (actorId) {
      await this.actionLogService.logAction({
        actionType: 'delete',
        feature: 'room',
        subFeature: null,
        actorId,
        actorName: actorName || null,
        branchId: room.branch.id,
        oldData: deletedData,
        newData: null,
        entityType: 'room',
        entityId: id,
        description: `Deleted room: ${room.name}`,
        status: 'success',
      });
    }
  }
}
