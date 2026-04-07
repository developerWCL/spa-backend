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
      name: 'Patong Phuket',
      location: 'Patong, Phuket, Thailand',
      phone: '+66 (0) 7629 0435-6, +66 (0) 7629 0387',
      email: 'rsvn@orientalaspa.com',
    },
    {
      name: 'Deevana Patong Resort & Spa',
      location: 'Patong, Phuket, Thailand',
      phone: '+66 (0) 76317 179 Ext. Spa, +66 (0) 76 290 387 Ext. 21',
      email: 'rsvn@orientalaspa.com',
    },
    {
      name: 'Ramada by Wyndham Phuket Deevana Patong',
      location: 'Patong, Phuket, Thailand',
      phone: '+66 (0) 76207 500 Ext. Spa, +66 (0) 76 290 387 Ext. 21',
      email: 'rsvn@orientalaspa.com',
    },
    {
      name: 'Deevana Plaza Phuket Patong',
      location: 'Patong, Phuket, Thailand',
      phone: '+66 (0) 7630 2187, +66 (0) 76 290 387 Ext. 21',
      email: 'rsvn@orientalaspa.com',
    },
    {
      name: 'Deevana Plaza Krabi Aonang',
      location: 'Aonang, Krabi, Thailand',
      phone: '+66 (0) 75 639 999 Ext. 6',
      email: 'spa@deevanaplazakrabi.com',
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
