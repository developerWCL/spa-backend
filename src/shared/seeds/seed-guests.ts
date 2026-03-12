import { dataSource } from '../../config/typeorm';
import { Guest } from '../../entities/guests.entity';
import { Spa } from '../../entities/spa.entity';
import { EntityGuestGender } from '../../entities/enums/entity-guest.enum';

export async function seedGuests() {
  const guestRepo = dataSource.getRepository(Guest);
  const spaRepo = dataSource.getRepository(Spa);

  const spa = await spaRepo.findOne({ where: {} });

  if (!spa) {
    console.log('No spa found. Please run seed-spa first.');
    return;
  }

  const guests = [
    {
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.taylor@example.com',
      phone: '+66-87-890-1234',
      source: 'walk-in',
    },
    {
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@example.com',
      phone: '+66-88-901-2345',
      source: 'referral',
    },
    {
      firstName: 'Thomas',
      lastName: 'Martin',
      email: 'thomas.martin@example.com',
      phone: '+66-89-012-3456',
      source: 'online',
    },
    {
      firstName: 'Jennifer',
      lastName: 'Garcia',
      email: 'jennifer.garcia@example.com',
      phone: '+66-90-123-4567',
      source: 'walk-in',
    },
  ];

  for (const guestData of guests) {
    const existingGuest = guestData.email
      ? await guestRepo.findOne({
          where: { email: guestData.email },
        })
      : null;

    if (!existingGuest) {
      const guest = guestRepo.create({
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        phone: guestData.phone,
        gender: EntityGuestGender.MALE,
        spa,
      });
      await guestRepo.save(guest);
      console.log(
        `Guest '${guestData.firstName} ${guestData.lastName}' seeded successfully`,
      );
    } else {
      console.log(`Guest '${guestData.email}' already exists`);
    }
  }
}
