import { dataSource } from '../../config/typeorm';
import { Room } from '../../entities/rooms.entity';
import { Branch } from '../../entities/branch.entity';
import { RoomStatus } from '../../entities/enums/entity-room.enum';

export async function seedRooms() {
  const roomRepo = dataSource.getRepository(Room);
  const branchRepo = dataSource.getRepository(Branch);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const rooms = [
    {
      name: 'Massage Room 1',
      type: 'massage',
      capacity: 1,
      floor: 'Ground',
      size: '20m²',
      status: RoomStatus.AVAILABLE,
    },
    {
      name: 'Massage Room 2',
      type: 'massage',
      capacity: 2,
      floor: 'Ground',
      size: '25m²',
      status: RoomStatus.AVAILABLE,
    },
    {
      name: 'Facial Treatment Room 1',
      type: 'facial',
      capacity: 1,
      floor: '1st',
      size: '18m²',
      status: RoomStatus.AVAILABLE,
    },
    {
      name: 'Facial Treatment Room 2',
      type: 'facial',
      capacity: 1,
      floor: '1st',
      size: '18m²',
      status: RoomStatus.AVAILABLE,
    },
    {
      name: 'Body Treatment Room',
      type: 'body',
      capacity: 2,
      floor: '1st',
      size: '30m²',
      status: RoomStatus.AVAILABLE,
    },
    {
      name: 'Foot Care Room',
      type: 'foot_care',
      capacity: 2,
      floor: '2nd',
      size: '22m²',
      status: RoomStatus.AVAILABLE,
    },
    {
      name: 'VIP Suite',
      type: 'vip',
      capacity: 4,
      floor: '2nd',
      size: '50m²',
      status: RoomStatus.AVAILABLE,
    },
  ];

  for (const roomData of rooms) {
    const existingRoom = await roomRepo.findOne({
      where: { name: roomData.name, branch: { id: branch.id } },
    });

    if (!existingRoom) {
      const room = roomRepo.create({
        ...roomData,
        branch,
      });
      await roomRepo.save(room);
      console.log(`Room '${roomData.name}' seeded successfully`);
    } else {
      console.log(`Room '${roomData.name}' already exists`);
    }
  }
}
