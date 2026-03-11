import { dataSource } from '../../config/typeorm';
import { BranchSpecialClosures } from '../../entities/branch_special_closures.entity';
import { Branch } from '../../entities/branch.entity';

export async function seedBranchSpecialClosures() {
  const closuresRepo = dataSource.getRepository(BranchSpecialClosures);
  const branchRepo = dataSource.getRepository(Branch);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  const closureConfigs = [
    {
      reason: 'New Year Day',
      specificDate: formatDate(new Date(new Date().getFullYear(), 0, 1)),
    },
    {
      reason: 'Songkran Festival (Thai New Year)',
      specificDate: formatDate(new Date(new Date().getFullYear(), 3, 13)),
    },
    {
      reason: 'Loy Krathong Festival',
      specificDate: formatDate(new Date(new Date().getFullYear(), 10, 12)),
    },
  ];

  for (const closureData of closureConfigs) {
    const existingClosure = await closuresRepo.findOne({
      where: {
        branch: { id: branch.id },
        specificDate: closureData.specificDate,
      },
    });

    if (!existingClosure) {
      const closure = closuresRepo.create({
        branch,
        reason: closureData.reason,
        specificDate: closureData.specificDate,
        isAllDay: true,
      });
      await closuresRepo.save(closure);
      const closureName = closureData.reason;
      console.log(`Special closure '${closureName}' seeded successfully`);
    } else {
      const closureName = closureData.reason;
      console.log(`Special closure '${closureName}' already exists`);
    }
  }
}
