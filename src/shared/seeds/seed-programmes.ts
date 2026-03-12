import { dataSource } from '../../config/typeorm';
import { Programme } from '../../entities/programmes.entity';
import { Branch } from '../../entities/branch.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';
import { ProgrammeTranslation } from 'src/entities/programme_translation.entity';

export async function seedProgrammes() {
  const programmeRepo = dataSource.getRepository(Programme);
  const branchRepo = dataSource.getRepository(Branch);
  const translationRepo = dataSource.getRepository(ProgrammeTranslation);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const programmes = [
    {
      name: '7-Day Detox Programme',
      description: 'Complete detoxification programme over 7 days',
      price: '7000',
      maxConcurrentBookings: 10,
      status: EntityStatus.ACTIVE,
      duration: 7,
    },
    {
      name: '14-Day Beauty Programme',
      description: 'Comprehensive beauty enhancement programme',
      price: '12000',
      maxConcurrentBookings: 8,
      status: EntityStatus.ACTIVE,
      duration: 14,
    },
    {
      name: '30-Day Wellness Programme',
      description: 'Complete wellness restoration programme',
      price: '25000',
      maxConcurrentBookings: 5,
      status: EntityStatus.ACTIVE,
      duration: 30,
    },
    {
      name: 'Stress Relief Programme',
      description: 'Specialized stress management programme',
      price: '5000',
      maxConcurrentBookings: 15,
      status: EntityStatus.ACTIVE,
      duration: 5,
    },
  ];

  for (const programmeData of programmes) {
    const existingProgramme = await programmeRepo.findOne({
      where: { name: programmeData.name },
    });

    if (!existingProgramme) {
      const { ...rest } = programmeData;
      const programme = programmeRepo.create({
        ...rest,
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
      console.log(`Programme '${programmeData.name}' seeded successfully`);
    } else {
      console.log(`Programme '${programmeData.name}' already exists`);
    }
  }
}
