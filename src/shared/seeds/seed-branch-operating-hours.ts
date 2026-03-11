import { dataSource } from '../../config/typeorm';
import { BranchOperatingHours } from '../../entities/branch_operating_hours.entity';
import { Branch } from '../../entities/branch.entity';

export async function seedBranchOperatingHours() {
  const operatingHoursRepo = dataSource.getRepository(BranchOperatingHours);
  const branchRepo = dataSource.getRepository(Branch);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  // Standard operating hours: Monday(1) to Sunday(0)
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const operatingHoursConfig = [
    { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00' }, // Monday
    { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00' }, // Tuesday
    { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00' }, // Wednesday
    { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00' }, // Thursday
    { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00' }, // Friday
    { dayOfWeek: 6, openTime: '09:00', closeTime: '22:00' }, // Saturday (Late night)
    { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00' }, // Sunday
  ];

  for (const hourConfig of operatingHoursConfig) {
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
        `Operating hours for ${dayNames[hourConfig.dayOfWeek]} seeded successfully`,
      );
    }
  }
}
