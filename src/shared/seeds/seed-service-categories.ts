import { dataSource } from '../../config/typeorm';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { Branch } from '../../entities/branch.entity';

export async function seedServiceCategories() {
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const branchRepo = dataSource.getRepository(Branch);

  // Define categories for each branch
  const branchCategoriesConfig: {
    [branchName: string]: {
      name: string;
      description: string;
      displayOrder: number;
    }[];
  } = {
    'Deevana Patong Resort & Spa': [
      {
        name: 'TREATMENT',
        description: 'Spa treatment services',
        displayOrder: 1,
      },
      {
        name: 'Classic Experience',
        description: 'Classic spa experience packages',
        displayOrder: 2,
      },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        displayOrder: 3,
      },
    ],
    'Patong Phuket': [
      {
        name: 'TREATMENT',
        description: 'Spa treatment services',
        displayOrder: 1,
      },
      {
        name: 'Classic Experience',
        description: 'Classic spa experience packages',
        displayOrder: 2,
      },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        displayOrder: 3,
      },
    ],
    'Ramada by Wyndham Phuket Deevana Patong': [
      {
        name: 'TREATMENT',
        description: 'Spa treatment services',
        displayOrder: 1,
      },
      {
        name: 'Classic Experience',
        description: 'Classic spa experience packages',
        displayOrder: 2,
      },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        displayOrder: 3,
      },
    ],
    'Deevana Plaza Phuket Patong': [
      {
        name: 'TREATMENT',
        description: 'Spa treatment services',
        displayOrder: 1,
      },
      {
        name: 'Classic Experience',
        description: 'Classic spa experience packages',
        displayOrder: 2,
      },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        displayOrder: 3,
      },
    ],
    'Deevana Plaza Krabi Aonang': [
      {
        name: 'TREATMENT',
        description: 'Spa treatment services',
        displayOrder: 1,
      },
      {
        name: 'Classic Experience',
        description: 'Classic spa experience packages',
        displayOrder: 2,
      },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        displayOrder: 3,
      },
    ],
    'Web Connection Spa - Patong Branch': [
      {
        name: 'Thai Massage',
        description: 'Traditional Thai massage services',
        displayOrder: 1,
      },
      {
        name: 'Relaxation Packages',
        description: 'Relaxation and stress relief packages',
        displayOrder: 2,
      },
      {
        name: 'Facial Care',
        description: 'Facial treatment and skincare services',
        displayOrder: 3,
      },
      {
        name: 'Body Treatments',
        description: 'Full body treatment and body scrub services',
        displayOrder: 4,
      },
    ],
    'Web Connection Spa - Karon Branch': [
      {
        name: 'Wellness Services',
        description: 'Holistic wellness and health services',
        displayOrder: 1,
      },
      {
        name: 'Deep Tissue Massage',
        description: 'Deep tissue and therapeutic massage',
        displayOrder: 2,
      },
      {
        name: 'Premium Therapies',
        description: 'Premium therapeutic treatments',
        displayOrder: 3,
      },
      {
        name: 'Couple Packages',
        description: 'Special packages for couples',
        displayOrder: 4,
      },
    ],
  };

  // Get all branches
  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branches found. Skipping service categories seed.');
    return;
  }

  // Seed categories for each branch
  for (const branch of branches) {
    const categories = branchCategoriesConfig[branch.name];

    if (!categories) {
      console.log(`No categories config found for branch '${branch.name}'`);
      continue;
    }

    for (const catData of categories) {
      let category = await categoryRepo.findOne({
        where: { name: catData.name, branch: { id: branch.id } },
      });

      if (!category) {
        category = categoryRepo.create({
          name: catData.name,
          description: catData.description,
          displayOrder: catData.displayOrder,
          branch,
          isActive: true,
        });
        category = await categoryRepo.save(category);
        console.log(
          `Created service category '${catData.name}' for branch '${branch.name}'`,
        );
      } else {
        console.log(
          `Service category '${catData.name}' already exists for branch '${branch.name}'`,
        );
      }
    }
  }
}
