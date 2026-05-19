import { dataSource } from '../../config/typeorm';
import { BranchOperatingHours } from '../../entities/branch_operating_hours.entity';
import { Branch } from '../../entities/branch.entity';

export async function seedBranchOperatingHours() {
  const operatingHoursRepo = dataSource.getRepository(BranchOperatingHours);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  // Branch-specific operating hours
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const branchOperatingHoursConfig: {
    [branchName: string]: {
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
    }[];
  } = {
    'Patong Phuket': [
      { dayOfWeek: 0, openTime: '11:00', closeTime: '22:00' }, // Sunday: 11:00 - 22:00
      { dayOfWeek: 1, openTime: '11:00', closeTime: '22:00' }, // Monday: 11:00 - 22:00
      { dayOfWeek: 2, openTime: '11:00', closeTime: '22:00' }, // Tuesday: 11:00 - 22:00
      { dayOfWeek: 3, openTime: '11:00', closeTime: '22:00' }, // Wednesday: 11:00 - 22:00
      { dayOfWeek: 4, openTime: '11:00', closeTime: '22:00' }, // Thursday: 11:00 - 22:00
      { dayOfWeek: 5, openTime: '11:00', closeTime: '22:00' }, // Friday: 11:00 - 22:00
      { dayOfWeek: 6, openTime: '11:00', closeTime: '22:00' }, // Saturday: 11:00 - 22:00
    ],
    'Deevana Patong Resort & Spa': [
      { dayOfWeek: 0, openTime: '11:00', closeTime: '19:00' }, // Sunday: 11:00 - 19:00
      { dayOfWeek: 1, openTime: '11:00', closeTime: '19:00' }, // Monday: 11:00 - 19:00
      { dayOfWeek: 2, openTime: '11:00', closeTime: '19:00' }, // Tuesday: 11:00 - 19:00
      { dayOfWeek: 3, openTime: '11:00', closeTime: '19:00' }, // Wednesday: 11:00 - 19:00
      { dayOfWeek: 4, openTime: '11:00', closeTime: '19:00' }, // Thursday: 11:00 - 19:00
      { dayOfWeek: 5, openTime: '11:00', closeTime: '19:00' }, // Friday: 11:00 - 19:00
      { dayOfWeek: 6, openTime: '11:00', closeTime: '19:00' }, // Saturday: 11:00 - 19:00
    ],
    'Ramada by Wyndham Phuket Deevana Patong': [
      { dayOfWeek: 0, openTime: '11:00', closeTime: '19:00' }, // Sunday: 11:00 - 19:00
      { dayOfWeek: 1, openTime: '11:00', closeTime: '19:00' }, // Monday: 11:00 - 19:00
      { dayOfWeek: 2, openTime: '11:00', closeTime: '19:00' }, // Tuesday: 11:00 - 19:00
      { dayOfWeek: 3, openTime: '11:00', closeTime: '19:00' }, // Wednesday: 11:00 - 19:00
      { dayOfWeek: 4, openTime: '11:00', closeTime: '19:00' }, // Thursday: 11:00 - 19:00
      { dayOfWeek: 5, openTime: '11:00', closeTime: '19:00' }, // Friday: 11:00 - 19:00
      { dayOfWeek: 6, openTime: '11:00', closeTime: '19:00' }, // Saturday: 11:00 - 19:00
    ],
    'Deevana Plaza Phuket Patong': [
      { dayOfWeek: 0, openTime: '11:00', closeTime: '19:00' }, // Sunday: 11:00 - 19:00
      { dayOfWeek: 1, openTime: '11:00', closeTime: '19:00' }, // Monday: 11:00 - 19:00
      { dayOfWeek: 2, openTime: '11:00', closeTime: '19:00' }, // Tuesday: 11:00 - 19:00
      { dayOfWeek: 3, openTime: '11:00', closeTime: '19:00' }, // Wednesday: 11:00 - 19:00
      { dayOfWeek: 4, openTime: '11:00', closeTime: '19:00' }, // Thursday: 11:00 - 19:00
      { dayOfWeek: 5, openTime: '11:00', closeTime: '19:00' }, // Friday: 11:00 - 19:00
      { dayOfWeek: 6, openTime: '11:00', closeTime: '19:00' }, // Saturday: 11:00 - 19:00
    ],
    'Deevana Plaza Krabi Aonang': [
      { dayOfWeek: 0, openTime: '09:00', closeTime: '21:00' }, // Sunday: 09:00 - 21:00
      { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00' }, // Monday: 09:00 - 21:00
      { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00' }, // Tuesday: 09:00 - 21:00
      { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00' }, // Wednesday: 09:00 - 21:00
      { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00' }, // Thursday: 09:00 - 21:00
      { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00' }, // Friday: 09:00 - 21:00
      { dayOfWeek: 6, openTime: '09:00', closeTime: '21:00' }, // Saturday: 09:00 - 21:00
    ],
    'Web Connection Spa - Patong Branch': [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00' }, // Sunday: 10:00 - 20:00
      { dayOfWeek: 1, openTime: '10:00', closeTime: '20:00' }, // Monday: 10:00 - 20:00
      { dayOfWeek: 2, openTime: '10:00', closeTime: '20:00' }, // Tuesday: 10:00 - 20:00
      { dayOfWeek: 3, openTime: '10:00', closeTime: '20:00' }, // Wednesday: 10:00 - 20:00
      { dayOfWeek: 4, openTime: '10:00', closeTime: '20:00' }, // Thursday: 10:00 - 20:00
      { dayOfWeek: 5, openTime: '10:00', closeTime: '20:00' }, // Friday: 10:00 - 20:00
      { dayOfWeek: 6, openTime: '10:00', closeTime: '20:00' }, // Saturday: 10:00 - 20:00
    ],
    'Web Connection Spa - Karon Branch': [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00' }, // Sunday: 10:00 - 20:00
      { dayOfWeek: 1, openTime: '10:00', closeTime: '20:00' }, // Monday: 10:00 - 20:00
      { dayOfWeek: 2, openTime: '10:00', closeTime: '20:00' }, // Tuesday: 10:00 - 20:00
      { dayOfWeek: 3, openTime: '10:00', closeTime: '20:00' }, // Wednesday: 10:00 - 20:00
      { dayOfWeek: 4, openTime: '10:00', closeTime: '20:00' }, // Thursday: 10:00 - 20:00
      { dayOfWeek: 5, openTime: '10:00', closeTime: '20:00' }, // Friday: 10:00 - 20:00
      { dayOfWeek: 6, openTime: '10:00', closeTime: '20:00' }, // Saturday: 10:00 - 20:00
    ],
  };

  for (const branch of branches) {
    const branchHours = branchOperatingHoursConfig[branch.name];

    if (!branchHours) {
      console.log(
        `No operating hours config found for branch '${branch.name}'`,
      );
      continue;
    }

    for (const hourConfig of branchHours) {
      const existingHours = await operatingHoursRepo.findOne({
        where: {
          branch: { id: branch.id },
          dayOfWeek: hourConfig.dayOfWeek,
        },
      });

      if (!existingHours) {
        const hours = operatingHoursRepo.create({
          branch,
          dayOfWeek: hourConfig.dayOfWeek,
          openTime: hourConfig.openTime,
          closeTime: hourConfig.closeTime,
        });
        await operatingHoursRepo.save(hours);

        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        console.log(
          `Operating hours for ${branch.name} - ${dayNames[hourConfig.dayOfWeek]} seeded successfully`,
        );
      }
    }
  }
}
