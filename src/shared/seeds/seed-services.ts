import { dataSource } from '../../config/typeorm';
import { Service } from '../../entities/services.entity';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { Branch } from '../../entities/branch.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';

export async function seedServices() {
  const serviceRepo = dataSource.getRepository(Service);
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const branchRepo = dataSource.getRepository(Branch);

  const branch = await branchRepo.findOne({ where: {} });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const serviceCategories = await categoryRepo.find({
    where: { branch: { id: branch.id } },
  });

  const massageCategory =
    serviceCategories.find((c) => c.name === 'Massage') || serviceCategories[0];
  const facialCategory =
    serviceCategories.find((c) => c.name === 'Facial Treatment') ||
    serviceCategories[1];
  const bodyCategory =
    serviceCategories.find((c) => c.name === 'Body Treatment') ||
    serviceCategories[2];
  const footCategory =
    serviceCategories.find((c) => c.name === 'Foot Care') ||
    serviceCategories[3];

  const services = [
    // Massage Services
    {
      name: 'Thai Massage',
      description: 'Traditional Thai massage therapy',
      basePrice: '800',
      durationMinutes: 60,
      category: massageCategory,
    },
    {
      name: 'Swedish Massage',
      description: 'Relaxing Swedish massage therapy',
      basePrice: '900',
      durationMinutes: 60,
      category: massageCategory,
    },
    {
      name: 'Deep Tissue Massage',
      description: 'Deep tissue massage for muscle relief',
      basePrice: '1000',
      durationMinutes: 60,
      category: massageCategory,
    },
    {
      name: 'Hot Stone Massage',
      description: 'Massage with heated stones',
      basePrice: '1200',
      durationMinutes: 60,
      category: massageCategory,
    },

    // Facial Services
    {
      name: 'Hydrating Facial',
      description: 'Deep hydrating facial treatment',
      basePrice: '700',
      durationMinutes: 45,
      category: facialCategory,
    },
    {
      name: 'Anti-Aging Facial',
      description: 'Advanced anti-aging facial treatment',
      basePrice: '1000',
      durationMinutes: 60,
      category: facialCategory,
    },
    {
      name: 'Brightening Facial',
      description: 'Brightening and whitening facial',
      basePrice: '850',
      durationMinutes: 50,
      category: facialCategory,
    },

    // Body Services
    {
      name: 'Body Scrub',
      description: 'Exfoliating body scrub treatment',
      basePrice: '750',
      durationMinutes: 45,
      category: bodyCategory,
    },
    {
      name: 'Body Wrap',
      description: 'Nourishing body wrap treatment',
      basePrice: '900',
      durationMinutes: 50,
      category: bodyCategory,
    },
    {
      name: 'Full Body Treatment',
      description: 'Complete body spa treatment',
      basePrice: '1500',
      durationMinutes: 90,
      category: bodyCategory,
    },

    // Foot Care Services
    {
      name: 'Thai Foot Massage',
      description: 'Traditional Thai foot massage',
      basePrice: '600',
      durationMinutes: 45,
      category: footCategory,
    },
    {
      name: 'Foot Reflexology',
      description: 'Therapeutic foot reflexology',
      basePrice: '700',
      durationMinutes: 50,
      category: footCategory,
    },
    {
      name: 'Pedicure Package',
      description: 'Complete pedicure and foot care',
      basePrice: '650',
      durationMinutes: 50,
      category: footCategory,
    },
  ];

  for (const serviceData of services) {
    const existingService = await serviceRepo.findOne({
      where: { name: serviceData.name, branch: { id: branch.id } },
    });

    if (!existingService) {
      const service = serviceRepo.create({
        ...serviceData,
        branch,
        status: EntityStatus.ACTIVE,
      });
      await serviceRepo.save(service);
      console.log(`Service '${serviceData.name}' seeded successfully`);
    } else {
      console.log(`Service '${serviceData.name}' already exists`);
    }
  }
}
