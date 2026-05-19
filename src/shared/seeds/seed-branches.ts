import { dataSource } from '../../config/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Spa } from '../../entities/spa.entity';

export async function seedBranches() {
  const branchRepo = dataSource.getRepository(Branch);
  const spaRepo = dataSource.getRepository(Spa);

  const OrSpa = await spaRepo.findOne({
    where: {
      name: 'Orientala Spa',
    },
  });

  const WcSpa = await spaRepo.findOne({
    where: {
      name: 'Web Connection Spa',
    },
  });

  const branches = [
    {
      name: 'Patong Phuket',
      location: 'Phuket',
      phone: '+66 (0) 7629 0435-6, +66 (0) 7629 0387',
      email: 'rsvn@orientalaspa.com',
      spa: OrSpa,
    },
    {
      name: 'Deevana Patong Resort & Spa',
      location: 'Phuket',
      phone: '+66 (0) 76317 179 Ext. Spa, +66 (0) 76 290 387 Ext. 21',
      email: 'rsvn@orientalaspa.com',
      spa: OrSpa,
    },
    {
      name: 'Ramada by Wyndham Phuket Deevana Patong',
      location: 'Phuket',
      phone: '+66 (0) 76207 500 Ext. Spa, +66 (0) 76 290 387 Ext. 21',
      email: 'rsvn@orientalaspa.com',
      spa: OrSpa,
    },
    {
      name: 'Deevana Plaza Phuket Patong',
      location: 'Phuket',
      phone: '+66 (0) 7630 2187, +66 (0) 76 290 387 Ext. 21',
      email: 'rsvn@orientalaspa.com',
      spa: OrSpa,
    },
    {
      name: 'Deevana Plaza Krabi Aonang',
      location: 'Krabi',
      phone: '+66 (0) 75 639 999 Ext. 6',
      email: 'spa@deevanaplazakrabi.com',
      spa: OrSpa,
    },
    {
      name: 'Web Connection Spa - Patong Branch',
      location: 'Phuket',
      phone: '',
      email: '',
      spa: WcSpa,
    },
    {
      name: 'Web Connection Spa - Karon Branch',
      location: 'Phuket',
      phone: '',
      email: '',
      spa: WcSpa,
    },
  ];

  for (const branchData of branches) {
    const existingBranch = await branchRepo.findOne({
      where: { name: branchData.name },
    });

    if (!existingBranch) {
      const branch = branchRepo.create({
        ...branchData,
      });
      await branchRepo.save(branch);
      console.log(`Branch '${branchData.name}' seeded successfully`);
    } else {
      console.log(`Branch '${branchData.name}' already exists`);
    }
  }
}
