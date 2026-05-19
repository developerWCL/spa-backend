import { dataSource } from '../../config/typeorm';
import { Programme } from '../../entities/programmes.entity';
import { Branch } from '../../entities/branch.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';
import { ProgrammeTranslation } from 'src/entities/programme_translation.entity';

export async function seedProgrammes() {
  const programmeRepo = dataSource.getRepository(Programme);
  const branchRepo = dataSource.getRepository(Branch);
  const translationRepo = dataSource.getRepository(ProgrammeTranslation);

  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  // Define programmes for each branch
  const branchProgrammesConfig: {
    [branchName: string]: {
      name: string;
      description: string;
      price: string;
      maxConcurrentBookings: number;
      status: EntityStatus;
      duration: number;
    }[];
  } = {
    // 'Deevana Patong Resort & Spa': [
    //   {
    //     name: '7-Day Detox Programme',
    //     description: 'Complete detoxification programme over 7 days',
    //     price: '7000',
    //     maxConcurrentBookings: 10,
    //     status: EntityStatus.ACTIVE,
    //     duration: 7,
    //   },
    //   {
    //     name: '14-Day Beauty Programme',
    //     description: 'Comprehensive beauty enhancement programme',
    //     price: '12000',
    //     maxConcurrentBookings: 8,
    //     status: EntityStatus.ACTIVE,
    //     duration: 14,
    //   },
    //   {
    //     name: '30-Day Wellness Programme',
    //     description: 'Complete wellness restoration programme',
    //     price: '25000',
    //     maxConcurrentBookings: 5,
    //     status: EntityStatus.ACTIVE,
    //     duration: 30,
    //   },
    //   {
    //     name: 'Stress Relief Programme',
    //     description: 'Specialized stress management programme',
    //     price: '5000',
    //     maxConcurrentBookings: 15,
    //     status: EntityStatus.ACTIVE,
    //     duration: 5,
    //   },
    // ],
    'Web Connection Spa - Patong Branch': [
      {
        name: 'Thai Wellness 5-Day Retreat',
        description:
          'Traditional Thai wellness retreat focusing on relaxation and rejuvenation',
        price: '5500',
        maxConcurrentBookings: 12,
        status: EntityStatus.ACTIVE,
        duration: 5,
      },
      {
        name: '10-Day Facial Beauty Programme',
        description: 'Intensive facial care and skin rejuvenation programme',
        price: '9000',
        maxConcurrentBookings: 10,
        status: EntityStatus.ACTIVE,
        duration: 10,
      },
      {
        name: '7-Day Relaxation Escape',
        description:
          'Ultimate relaxation programme with aromatherapy and massage',
        price: '7500',
        maxConcurrentBookings: 8,
        status: EntityStatus.ACTIVE,
        duration: 7,
      },
      {
        name: '14-Day Full Body Transformation',
        description: 'Comprehensive body care and wellness transformation',
        price: '14000',
        maxConcurrentBookings: 6,
        status: EntityStatus.ACTIVE,
        duration: 14,
      },
    ],
    'Web Connection Spa - Karon Branch': [
      {
        name: 'Deep Recovery 7-Day Programme',
        description:
          'Intensive deep tissue therapy and muscle recovery programme',
        price: '8000',
        maxConcurrentBookings: 10,
        status: EntityStatus.ACTIVE,
        duration: 7,
      },
      {
        name: 'Holistic Wellness 10-Day Journey',
        description:
          'Complete holistic wellness journey with chakra balancing and therapy',
        price: '11000',
        maxConcurrentBookings: 8,
        status: EntityStatus.ACTIVE,
        duration: 10,
      },
      {
        name: 'Premium Healing 14-Day Retreat',
        description:
          'Premium therapeutic healing and wellness restoration programme',
        price: '18000',
        maxConcurrentBookings: 5,
        status: EntityStatus.ACTIVE,
        duration: 14,
      },
      {
        name: 'Couples Romance 7-Day Escape',
        description: 'Special couples retreat with romantic spa experiences',
        price: '13000',
        maxConcurrentBookings: 6,
        status: EntityStatus.ACTIVE,
        duration: 7,
      },
    ],
  };

  // Seed programmes for each branch
  for (const branch of branches) {
    const branchProgrammes = branchProgrammesConfig[branch.name];

    if (!branchProgrammes) {
      console.log(`No programmes config found for branch '${branch.name}'`);
      continue;
    }

    for (const programmeData of branchProgrammes) {
      const existingProgramme = await programmeRepo.findOne({
        where: { name: programmeData.name, branch: { id: branch.id } },
      });

      if (!existingProgramme) {
        const programme = programmeRepo.create({
          name: programmeData.name,
          description: programmeData.description,
          price: programmeData.price,
          maxConcurrentBookings: programmeData.maxConcurrentBookings,
          status: programmeData.status,
          branch,
        });
        await programmeRepo.save(programme);

        const translation = translationRepo.create({
          name: programmeData.name,
          description: programmeData.description,
          languageCode: 'en',
          programme,
        });
        await translationRepo.save(translation);
        console.log(
          `Programme '${programmeData.name}' created for branch '${branch.name}'`,
        );
      } else {
        console.log(
          `Programme '${programmeData.name}' already exists for branch '${branch.name}'`,
        );
      }
    }
  }
}
