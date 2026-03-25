import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { RoomBedClosure } from 'src/entities/room_bed_closure.entity';
import { Room } from 'src/entities/rooms.entity';
import { Bed } from 'src/entities/beds.entity';
import {
  CreateRoomBedClosureDto,
  UpdateRoomBedClosureDto,
} from './room-bed-closure.types';

@Injectable()
export class RoomBedClosureService {
  constructor(
    @InjectRepository(RoomBedClosure)
    private readonly closureRepo: Repository<RoomBedClosure>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Bed)
    private readonly bedRepo: Repository<Bed>,
  ) {}

  async create(dto: CreateRoomBedClosureDto): Promise<RoomBedClosure> {
    // At least one of roomId or bedId must be provided
    if (!dto.roomId && !dto.bedId) {
      throw new BadRequestException('Either roomId or bedId must be provided');
    }

    if (dto.roomId && !dto.bedId) {
      const existingClosures = await this.closureRepo.count({
        where: {
          room: { id: dto.roomId },
          closureDate: new Date(dto.closureDate),
        },
      });
      if (existingClosures > 0) {
        throw new BadRequestException(
          'A closure already exists for this room on the specified date',
        );
      }
    }
    if (dto.bedId) {
      const existingClosures = await this.closureRepo.count({
        where: {
          bed: { id: dto.bedId },
          closureDate: new Date(dto.closureDate),
        },
      });
      if (existingClosures > 0) {
        throw new BadRequestException(
          'A closure already exists for this bed on the specified date',
        );
      }
    }

    let room: Room | null = null;
    let bed: Bed | null = null;

    // Validate room if provided
    if (dto.roomId) {
      room = await this.roomRepo.findOne({
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
      }
    }

    // Validate bed if provided
    if (dto.bedId) {
      bed = await this.bedRepo.findOne({
        where: { id: dto.bedId },
      });
      if (!bed) {
        throw new NotFoundException(`Bed with ID ${dto.bedId} not found`);
      }
    }

    const closure = this.closureRepo.create({
      ...dto,
      closureDate: new Date(dto.closureDate),
      room,
      bed,
    });

    return this.closureRepo.save(closure);
  }

  async findAll(
    branchId?: string,
    roomId?: string,
    bedId?: string,
    fromDate?: string,
    toDate?: string,
    search?: string,
  ): Promise<RoomBedClosure[]> {
    const query = this.closureRepo
      .createQueryBuilder('closure')
      .leftJoinAndSelect('closure.room', 'room')
      .leftJoinAndSelect('closure.bed', 'bed')
      .leftJoinAndSelect('room.branch', 'roomBranch')
      .leftJoinAndSelect('bed.branch', 'bedBranch')
      .orderBy('closure.closureDate', 'ASC');

    // Apply room filter
    if (roomId) {
      query.andWhere('room.id = :roomId', { roomId });
    }

    // Apply bed filter
    if (bedId) {
      query.andWhere('bed.id = :bedId', { bedId });
    }

    // Apply branch filter - use alias IDs
    if (branchId) {
      query.andWhere(
        '(roomBranch.id = :branchId OR bedBranch.id = :branchId)',
        { branchId },
      );
    }

    // Apply date range filter
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      query.andWhere(
        'DATE("closure"."closure_date") BETWEEN DATE(:from) AND DATE(:to)',
        {
          from,
          to,
        },
      );
    } else if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      query.andWhere('DATE("closure"."closure_date") >= DATE(:fromDate)', {
        fromDate: from,
      });
    } else if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      query.andWhere('DATE("closure"."closure_date") <= DATE(:toDate)', {
        toDate: to,
      });
    }

    // Apply search filter with OR logic
    if (search) {
      query.andWhere('(room.name ILIKE :search OR bed.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    const data = await query.getMany();

    return data;
  }

  async findOne(id: string): Promise<RoomBedClosure> {
    const closure = await this.closureRepo.findOne({
      where: { id },
      relations: ['room', 'bed'],
    });

    if (!closure) {
      throw new NotFoundException(`Room/Bed closure with ID ${id} not found`);
    }

    return closure;
  }

  async findByRoom(roomId: string): Promise<RoomBedClosure[]> {
    return this.findAll(undefined, roomId);
  }

  async findByBed(bedId: string): Promise<RoomBedClosure[]> {
    return this.findAll(undefined, undefined, bedId);
  }

  async isDatesAvailable(
    roomId: string | null,
    bedId: string | null,
    closureDate: Date,
  ): Promise<boolean> {
    const where: FindOptionsWhere<RoomBedClosure> = {
      closureDate,
    };

    if (roomId) {
      where.room = { id: roomId };
    }
    if (bedId) {
      where.bed = { id: bedId };
    }

    const count = await this.closureRepo.count({ where });
    return count === 0;
  }

  async update(
    id: string,
    dto: UpdateRoomBedClosureDto,
  ): Promise<RoomBedClosure> {
    const closure = await this.findOne(id);

    // If at least one of room or bed is being cleared, validate
    if ((dto.roomId || dto.bedId) && !dto.roomId && !dto.bedId) {
      throw new BadRequestException('Either roomId or bedId must be provided');
    }

    // Update room if provided
    if (dto.roomId && dto.roomId !== closure.room?.id) {
      const room = await this.roomRepo.findOne({
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${dto.roomId} not found`);
      }
      closure.room = room;
    }

    // Update bed if provided
    if (dto.bedId && dto.bedId !== closure.bed?.id) {
      const bed = await this.bedRepo.findOne({
        where: { id: dto.bedId },
      });
      if (!bed) {
        throw new NotFoundException(`Bed with ID ${dto.bedId} not found`);
      }
      closure.bed = bed;
    }

    // Update other fields
    if (dto.closureDate) {
      closure.closureDate = new Date(dto.closureDate);
    }
    if (dto.reason !== undefined) {
      closure.reason = dto.reason;
    }

    return this.closureRepo.save(closure);
  }

  async remove(id: string): Promise<void> {
    const closure = await this.findOne(id);
    await this.closureRepo.softDelete(closure.id);
  }
}
