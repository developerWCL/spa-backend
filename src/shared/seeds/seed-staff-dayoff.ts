import { dataSource } from '../../config/typeorm';
import { StaffDayoff, DayOffReason } from '../../entities/staff-dayoff.entity';
import { Staff } from '../../entities/staffs.entity';

export async function seedStaffDayoff() {
  const staffDayoffRepo = dataSource.getRepository(StaffDayoff);
  const staffRepo = dataSource.getRepository(Staff);

  const staffs = await staffRepo.find({ take: 3 });

  if (staffs.length === 0) {
    console.log('No staff found. Please run seed-staff first.');
    return;
  }

  const dayoffDates = [
    {
      staff: staffs[0],
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
      reason: DayOffReason.VACATION,
    },
    {
      staff: staffs[1],
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      reason: DayOffReason.PERSONAL,
    },
    {
      staff: staffs[2],
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
      reason: DayOffReason.VACATION,
    },
  ];

  for (const dayoffData of dayoffDates) {
    const existingDayoff = await staffDayoffRepo.findOne({
      where: {
        staff: { id: dayoffData.staff.id },
        date: dayoffData.date,
      },
    });

    if (!existingDayoff) {
      const dayoff = staffDayoffRepo.create(dayoffData);
      await staffDayoffRepo.save(dayoff);
      console.log(
        `Day-off created for staff on ${dayoffData.date.toDateString()}`,
      );
    } else {
      console.log(`Day-off already exists for this date`);
    }
  }
}
