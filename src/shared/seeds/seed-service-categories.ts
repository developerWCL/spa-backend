import { dataSource } from '../../config/typeorm';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { Branch } from '../../entities/branch.entity';

export async function seedServiceCategories() {
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const branchRepo = dataSource.getRepository(Branch);

  // Get the first branch (default branch)
  const branch = await branchRepo.findOne({
    where: {
      name: 'Deevana Patong Resort & Spa',
    },
  });

  if (!branch) {
    console.log('No branch found. Skipping service categories seed.');
    return;
  }

  const categories = [
    {
      name: 'TREATMENT',
      description: 'Spa treatment services',
      displayOrder: 1,
    },
    {
      name: 'MASSAGE',
      description: 'Massage therapy treatments',
      displayOrder: 2,
    },
    {
      name: 'SIGNATURE PACKAGES',
      description: 'Special signature spa packages',
      displayOrder: 3,
    },
    {
      name: 'FACIAL MASSAGE',
      description: 'Facial massage and treatments',
      displayOrder: 4,
    },
    {
      name: 'Classic Experience',
      description: 'Classic spa experience packages',
      displayOrder: 5,
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
