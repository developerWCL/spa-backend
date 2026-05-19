import { dataSource } from '../../config/typeorm';
import { Bed } from '../../entities/beds.entity';
import { Branch } from '../../entities/branch.entity';
import { Room } from '../../entities/rooms.entity';
import { BedType, RoomStatus } from '../../entities/enums/entity-room.enum';

export async function seedBeds() {
  const bedRepo = dataSource.getRepository(Bed);
  const branchRepo = dataSource.getRepository(Branch);
  const roomRepo = dataSource.getRepository(Room);

  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  // Define bed configurations for each branch
  const branchBedConfigs: {
    [branchName: string]: {
      roomName: string;
      beds: { name: string; type: BedType }[];
    }[];
  } = {
    // 'Deevana Patong Resort & Spa': [
    //   // Massage Room 1
    //   {
    //     roomName: 'Massage Room 1',
    //     beds: [{ name: 'Bed A', type: BedType.BED }],
    //   },
    //   // Massage Room 2
    //   {
    //     roomName: 'Massage Room 2',
    //     beds: [
    //       { name: 'Bed A', type: BedType.BED },
    //       { name: 'Bed B', type: BedType.BED },
    //     ],
    //   },
    //   // Facial Treatment Room 1
    //   {
    //     roomName: 'Facial Treatment Room 1',
    //     beds: [{ name: 'Chair A', type: BedType.CHAIR }],
    //   },
    //   // Facial Treatment Room 2
    //   {
    //     roomName: 'Facial Treatment Room 2',
    //     beds: [{ name: 'Chair A', type: BedType.CHAIR }],
    //   },
    //   // Body Treatment Room
    //   {
    //     roomName: 'Body Treatment Room',
    //     beds: [
    //       { name: 'Bed A', type: BedType.BED },
    //       { name: 'Bed B', type: BedType.BED },
    //     ],
    //   },
    //   // Foot Care Room
    //   {
    //     roomName: 'Foot Care Room',
    //     beds: [
    //       { name: 'Chair A', type: BedType.CHAIR },
    //       { name: 'Chair B', type: BedType.CHAIR },
    //     ],
    //   },
    //   // VIP Suite
    //   {
    //     roomName: 'VIP Suite',
    //     beds: [
    //       { name: 'Bed A', type: BedType.BED },
    //       { name: 'Bed B', type: BedType.BED },
    //       { name: 'Bed C', type: BedType.BED },
    //     ],
    //   },
    // ],
    'Web Connection Spa - Patong Branch': [
      // Thai Massage Room 1
      {
        roomName: 'Thai Massage Room 1',
        beds: [{ name: 'Bed A', type: BedType.BED }],
      },
      // Thai Massage Room 2
      {
        roomName: 'Thai Massage Room 2',
        beds: [
          { name: 'Bed A', type: BedType.BED },
          { name: 'Bed B', type: BedType.BED },
        ],
      },
      // Aromatherapy Room 1
      {
        roomName: 'Aromatherapy Room 1',
        beds: [{ name: 'Massage Bed', type: BedType.BED }],
      },
      // Aromatherapy Room 2
      {
        roomName: 'Aromatherapy Room 2',
        beds: [
          { name: 'Bed A', type: BedType.BED },
          { name: 'Bed B', type: BedType.BED },
        ],
      },
      // Facial Beauty Room 1
      {
        roomName: 'Facial Beauty Room 1',
        beds: [{ name: 'Treatment Chair', type: BedType.CHAIR }],
      },
      // Facial Beauty Room 2
      {
        roomName: 'Facial Beauty Room 2',
        beds: [{ name: 'Treatment Chair', type: BedType.CHAIR }],
      },
      // Body Treatment Suite
      {
        roomName: 'Body Treatment Suite',
        beds: [
          { name: 'Bed A', type: BedType.BED },
          { name: 'Bed B', type: BedType.BED },
        ],
      },
      // Relaxation Lounge
      {
        roomName: 'Relaxation Lounge',
        beds: [
          { name: 'Lounge Bed A', type: BedType.BED },
          { name: 'Lounge Bed B', type: BedType.BED },
          { name: 'Lounge Bed C', type: BedType.BED },
        ],
      },
    ],
    'Web Connection Spa - Karon Branch': [
      // Deep Tissue Therapy Room 1
      {
        roomName: 'Deep Tissue Therapy Room 1',
        beds: [{ name: 'Therapy Bed', type: BedType.BED }],
      },
      // Deep Tissue Therapy Room 2
      {
        roomName: 'Deep Tissue Therapy Room 2',
        beds: [{ name: 'Therapy Bed', type: BedType.BED }],
      },
      // Holistic Wellness Room
      {
        roomName: 'Holistic Wellness Room',
        beds: [
          { name: 'Bed A', type: BedType.BED },
          { name: 'Bed B', type: BedType.BED },
        ],
      },
      // Shiatsu Treatment Room
      {
        roomName: 'Shiatsu Treatment Room',
        beds: [{ name: 'Shiatsu Bed', type: BedType.BED }],
      },
      // Premium Healing Suite 1
      {
        roomName: 'Premium Healing Suite 1',
        beds: [
          { name: 'Healing Bed', type: BedType.BED },
          { name: 'Relaxation Chair', type: BedType.CHAIR },
        ],
      },
      // Premium Healing Suite 2
      {
        roomName: 'Premium Healing Suite 2',
        beds: [
          { name: 'Healing Bed', type: BedType.BED },
          { name: 'Relaxation Chair', type: BedType.CHAIR },
        ],
      },
      // Couples Retreat Room
      {
        roomName: 'Couples Retreat Room',
        beds: [
          { name: 'Bed A', type: BedType.BED },
          { name: 'Bed B', type: BedType.BED },
          { name: 'Couples Lounge', type: BedType.BED },
        ],
      },
      // Executive Relaxation Suite
      {
        roomName: 'Executive Relaxation Suite',
        beds: [
          { name: 'Bed A', type: BedType.BED },
          { name: 'Bed B', type: BedType.BED },
          { name: 'Relaxation Area', type: BedType.BED },
        ],
      },
    ],
  };

  // Seed beds for each branch
  for (const branch of branches) {
    const branchRooms = await roomRepo.find({
      where: { branch: { id: branch.id } },
    });

    if (!branchRooms.length) {
      console.log(
        `No rooms found for branch '${branch.name}'. Please run seed-rooms first.`,
      );
      continue;
    }

    const configs = branchBedConfigs[branch.name];

    if (!configs) {
      console.log(`No bed config found for branch '${branch.name}'`);
      continue;
    }

    for (const config of configs) {
      const room = branchRooms.find((r) => r.name === config.roomName);

      if (!room) {
        console.log(
          `Room '${config.roomName}' not found for branch '${branch.name}'. Skipping...`,
        );
        continue;
      }

      for (const bedData of config.beds) {
        const bedId = `${config.roomName}-${bedData.name}`;
        const existingBed = await bedRepo.findOne({
          where: { bedId, branch: { id: branch.id } },
        });

        if (!existingBed) {
          const bed = bedRepo.create({
            name: bedData.name,
            type: bedData.type,
            bedId,
            room,
            branch,
            status: RoomStatus.AVAILABLE,
          });
          await bedRepo.save(bed);
          console.log(
            `Bed '${bedData.name}' created in room '${config.roomName}' for branch '${branch.name}'`,
          );
        } else {
          console.log(
            `Bed '${bedData.name}' already exists in room '${config.roomName}' for branch '${branch.name}'`,
          );
        }
      }
    }
  }
}
