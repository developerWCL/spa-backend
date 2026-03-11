import { dataSource } from '../../config/typeorm';
import { Bed } from '../../entities/beds.entity';
import { Branch } from '../../entities/branch.entity';
import { Room } from '../../entities/rooms.entity';
import { BedType, RoomStatus } from '../../entities/enums/entity-room.enum';

export async function seedBeds() {
  const bedRepo = dataSource.getRepository(Bed);
  const branchRepo = dataSource.getRepository(Branch);
  const roomRepo = dataSource.getRepository(Room);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const rooms = await roomRepo.find({ where: { branch: { id: branch.id } } });

  const bedConfigs = [
    // Massage Room 1
    {
      roomName: 'Massage Room 1',
      beds: [{ name: 'Bed A', type: BedType.BED }],
    },
    // Massage Room 2
    {
      roomName: 'Massage Room 2',
      beds: [
        { name: 'Bed A', type: BedType.BED },
        { name: 'Bed B', type: BedType.BED },
      ],
    },
    // Facial Treatment Room 1
    {
      roomName: 'Facial Treatment Room 1',
      beds: [{ name: 'Chair A', type: BedType.CHAIR }],
    },
    // Facial Treatment Room 2
    {
      roomName: 'Facial Treatment Room 2',
      beds: [{ name: 'Chair A', type: BedType.CHAIR }],
    },
    // Body Treatment Room
    {
      roomName: 'Body Treatment Room',
      beds: [
        { name: 'Bed A', type: BedType.BED },
        { name: 'Bed B', type: BedType.BED },
      ],
    },
    // Foot Care Room
    {
      roomName: 'Foot Care Room',
      beds: [
        { name: 'Chair A', type: BedType.CHAIR },
        { name: 'Chair B', type: BedType.CHAIR },
      ],
    },
    // VIP Suite
    {
      roomName: 'VIP Suite',
      beds: [
        { name: 'Bed A', type: BedType.BED },
        { name: 'Bed B', type: BedType.BED },
        { name: 'Bed C', type: BedType.BED },
      ],
    },
  ];

  for (const config of bedConfigs) {
    const room = rooms.find((r) => r.name === config.roomName);

    if (!room) {
      console.log(`Room '${config.roomName}' not found. Skipping...`);
      continue;
    }

    for (const bedData of config.beds) {
      const bedId = `${config.roomName}-${bedData.name}`;
      const existingBed = await bedRepo.findOne({
        where: { bedId, branch: { id: branch.id } },
      });

      if (!existingBed) {
        const bed = bedRepo.create({
          ...bedData,
          bedId,
          room,
          branch,
          status: RoomStatus.AVAILABLE,
        });
        await bedRepo.save(bed);
        console.log(
          `Bed '${bedData.name}' in room '${config.roomName}' seeded successfully`,
        );
      } else {
        console.log(`Bed '${bedData.name}' already exists in room`);
      }
    }
  }
}
