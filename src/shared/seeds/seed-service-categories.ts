import { dataSource } from '../../config/typeorm';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { Branch } from '../../entities/branch.entity';

export async function seedServiceCategories() {
  await dataSource.initialize();
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const branchRepo = dataSource.getRepository(Branch);

  // Get the first branch (default branch)
  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Skipping service categories seed.');
    return;
  }

  const categories = [
    {
      name: 'Massage',
      description: 'Relaxing and therapeutic massage treatments',
      displayOrder: 1,
    },
    {
      name: 'Facial Treatment',
      description: 'Professional facial care and beauty treatments',
      displayOrder: 2,
    },
    {
      name: 'Body Treatment',
      description: 'Full body care and spa treatments',
      displayOrder: 3,
    },
    {
      name: 'Foot Care',
      description: 'Foot massage and pedicure services',
      displayOrder: 4,
    },
  ];

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
      console.log(`Created service category: ${catData.name}`);
    } else {
      console.log(`Service category already exists: ${catData.name}`);
    }
  }
}
