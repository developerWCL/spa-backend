import { dataSource } from '../../config/typeorm';
import { Package } from '../../entities/packages.entity';
import { Branch } from '../../entities/branch.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';
import { PackageTranslation } from 'src/entities/package_translation.entity';

export async function seedPackages() {
  const packageRepo = dataSource.getRepository(Package);
  const branchRepo = dataSource.getRepository(Branch);
  const translationRepo = dataSource.getRepository(PackageTranslation);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const today = new Date();
  const nextYear = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  );

  const packages = [
    {
      name: 'Relaxation Package',
      description: 'Full relaxation spa experience',
      price: '2500',
      startDate: today,
      endDate: nextYear,
      status: EntityStatus.ACTIVE,
    },
    {
      name: 'Beauty Package',
      description: 'Complete beauty care package',
      price: '3000',
      startDate: today,
      endDate: nextYear,
      status: EntityStatus.ACTIVE,
    },
    {
      name: 'Wellness Package',
      description: 'Health and wellness comprehensive package',
      price: '4000',
      startDate: today,
      endDate: nextYear,
      status: EntityStatus.ACTIVE,
    },
    {
      name: 'Honeymoon Package',
      description: 'Romantic couples spa package',
      price: '5500',
      startDate: today,
      endDate: nextYear,
      status: EntityStatus.ACTIVE,
    },
    {
      name: 'Corporate Wellness Package',
      description: 'Corporate team wellness package',
      price: '8000',
      startDate: today,
      endDate: nextYear,
      status: EntityStatus.ACTIVE,
    },
  ];

  for (const packageData of packages) {
    const existingPackage = await packageRepo.findOne({
      where: { name: packageData.name },
    });

    if (!existingPackage) {
      const pkg = packageRepo.create({
        ...packageData,
        branch,
      });
      await packageRepo.save(pkg);

      const translation = translationRepo.create({
        name: packageData.name,
        description: packageData.description,
        languageCode: 'en',
        package: pkg,
      });
      await translationRepo.save(translation);

      console.log(`Package '${packageData.name}' seeded successfully`);
    } else {
      console.log(`Package '${packageData.name}' already exists`);
    }
  }
}
