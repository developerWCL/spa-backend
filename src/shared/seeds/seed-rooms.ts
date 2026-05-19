import { dataSource } from '../../config/typeorm';
import { Room } from '../../entities/rooms.entity';
import { Branch } from '../../entities/branch.entity';
import { RoomStatus } from '../../entities/enums/entity-room.enum';

export async function seedRooms() {
  const roomRepo = dataSource.getRepository(Room);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  // Define rooms for each branch
  const branchRoomsConfig: {
    [branchName: string]: {
      name: string;
      type: string;
      capacity: number;
      floor: string;
      size: string;
      status: RoomStatus;
    }[];
  } = {
    // 'Deevana Patong Resort & Spa': [
    //   {
    //     name: 'Massage Room 1',
    //     type: 'massage',
    //     capacity: 1,
    //     floor: 'Ground',
    //     size: '20m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    //   {
    //     name: 'Massage Room 2',
    //     type: 'massage',
    //     capacity: 2,
    //     floor: 'Ground',
    //     size: '25m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    //   {
    //     name: 'Facial Treatment Room 1',
    //     type: 'facial',
    //     capacity: 1,
    //     floor: '1st',
    //     size: '18m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    //   {
    //     name: 'Facial Treatment Room 2',
    //     type: 'facial',
    //     capacity: 1,
    //     floor: '1st',
    //     size: '18m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    //   {
    //     name: 'Body Treatment Room',
    //     type: 'body',
    //     capacity: 2,
    //     floor: '1st',
    //     size: '30m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    //   {
    //     name: 'Foot Care Room',
    //     type: 'foot_care',
    //     capacity: 2,
    //     floor: '2nd',
    //     size: '22m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    //   {
    //     name: 'VIP Suite',
    //     type: 'vip',
    //     capacity: 4,
    //     floor: '2nd',
    //     size: '50m²',
    //     status: RoomStatus.AVAILABLE,
    //   },
    // ],
    'Web Connection Spa - Patong Branch': [
      {
        name: 'Thai Massage Room 1',
        type: 'massage',
        capacity: 1,
        floor: 'Ground',
        size: '22m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Thai Massage Room 2',
        type: 'massage',
        capacity: 2,
        floor: 'Ground',
        size: '28m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Aromatherapy Room 1',
        type: 'massage',
        capacity: 1,
        floor: '1st',
        size: '24m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Aromatherapy Room 2',
        type: 'massage',
        capacity: 2,
        floor: '1st',
        size: '30m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Facial Beauty Room 1',
        type: 'facial',
        capacity: 1,
        floor: '1st',
        size: '20m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Facial Beauty Room 2',
        type: 'facial',
        capacity: 1,
        floor: '1st',
        size: '20m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Body Treatment Suite',
        type: 'body',
        capacity: 2,
        floor: '2nd',
        size: '35m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Relaxation Lounge',
        type: 'vip',
        capacity: 3,
        floor: '2nd',
        size: '40m²',
        status: RoomStatus.AVAILABLE,
      },
    ],
    'Web Connection Spa - Karon Branch': [
      {
        name: 'Deep Tissue Therapy Room 1',
        type: 'massage',
        capacity: 1,
        floor: 'Ground',
        size: '25m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Deep Tissue Therapy Room 2',
        type: 'massage',
        capacity: 1,
        floor: 'Ground',
        size: '25m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Holistic Wellness Room',
        type: 'massage',
        capacity: 2,
        floor: '1st',
        size: '32m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Shiatsu Treatment Room',
        type: 'massage',
        capacity: 1,
        floor: '1st',
        size: '23m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Premium Healing Suite 1',
        type: 'vip',
        capacity: 2,
        floor: '1st',
        size: '40m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Premium Healing Suite 2',
        type: 'vip',
        capacity: 2,
        floor: '1st',
        size: '40m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Couples Retreat Room',
        type: 'vip',
        capacity: 4,
        floor: '2nd',
        size: '50m²',
        status: RoomStatus.AVAILABLE,
      },
      {
        name: 'Executive Relaxation Suite',
        type: 'vip',
        capacity: 3,
        floor: '2nd',
        size: '45m²',
        status: RoomStatus.AVAILABLE,
      },
    ],
  };

  // Seed rooms for each branch
  for (const branch of branches) {
    const branchRooms = branchRoomsConfig[branch.name];

    if (!branchRooms) {
      console.log(`No rooms config found for branch '${branch.name}'`);
      continue;
    }

    for (const roomData of branchRooms) {
      const existingRoom = await roomRepo.findOne({
        where: { name: roomData.name, branch: { id: branch.id } },
      });

      if (!existingRoom) {
        const room = roomRepo.create({
          name: roomData.name,
          type: roomData.type,
          capacity: roomData.capacity,
          floor: roomData.floor,
          size: roomData.size,
          status: roomData.status,
          branch,
        });
        await roomRepo.save(room);
        console.log(
          `Room '${roomData.name}' created for branch '${branch.name}'`,
        );
      } else {
        console.log(
          `Room '${roomData.name}' already exists for branch '${branch.name}'`,
        );
      }
    }
  }
}
