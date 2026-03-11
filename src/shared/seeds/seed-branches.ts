import { dataSource } from '../../config/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Spa } from '../../entities/spa.entity';

export async function seedBranches() {
  const branchRepo = dataSource.getRepository(Branch);
  const spaRepo = dataSource.getRepository(Spa);

  const spa = await spaRepo.findOne({ where: {} });

  if (!spa) {
    console.log('No spa found. Please run seed-spa first.');
    return;
  }

  const branches = [
    {
      name: 'Main Branch',
      location: '123 Wellness Street, Bangkok, Thailand',
      phone: '+66-2-123-4567',
      email: 'main@orientala-spa.com',
      website: 'https://main.orientala-spa.com',
    },
    {
      name: 'Sukhumvit Branch',
      location: '456 Sukhumvit Road, Bangkok, Thailand',
      phone: '+66-2-234-5678',
      email: 'sukhumvit@orientala-spa.com',
      website: 'https://sukhumvit.orientala-spa.com',
    },
    {
      name: 'Phuket Branch',
      location: '789 Phuket Street, Phuket, Thailand',
      phone: '+66-76-345-6789',
      email: 'phuket@orientala-spa.com',
      website: 'https://phuket.orientala-spa.com',
    },
  ];

  for (const branchData of branches) {
    const existingBranch = await branchRepo.findOne({
      where: { name: branchData.name },
    });

    if (!existingBranch) {
      const branch = branchRepo.create({
        ...branchData,
        spa,
      });
      await branchRepo.save(branch);
      console.log(`Branch '${branchData.name}' seeded successfully`);
    } else {
      console.log(`Branch '${branchData.name}' already exists`);
    }
  }
}
