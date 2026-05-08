import { dataSource } from '../../config/typeorm';
import { Service } from '../../entities/services.entity';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { ServiceTranslation } from '../../entities/service_translations.entity';
import { Branch } from '../../entities/branch.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';

export async function seedServices() {
  const serviceRepo = dataSource.getRepository(Service);
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const branchRepo = dataSource.getRepository(Branch);
  const translationRepo = dataSource.getRepository(ServiceTranslation);

  const branch = await branchRepo.findOne({
    where: {
      name: 'Deevana Patong Resort & Spa',
    },
  });

  if (!branch) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const serviceCategories = await categoryRepo.find({
    where: { branch: { id: branch.id } },
  });

  const treatmentCategory =
    serviceCategories.find((c) => c.name === 'TREATMENT') ||
    serviceCategories[0];
  const classicCategory =
    serviceCategories.find((c) => c.name === 'Classic Experience') ||
    serviceCategories[1];
  const onlyPackageCategory =
    serviceCategories.find((c) => c.name === 'ONLY_PACKAGE') ||
    serviceCategories[2];
  const services = [
    // TREATMENT Services
    {
      name: 'HERBAL STEAM',
      description: '',
      basePrice: '600',
      durationMinutes: 30,
      category: treatmentCategory,
    },
    {
      name: 'BUBBLE BATH / MILK BATH',
      description:
        'The benefits of soaking in a 40 degree mineral milk bath contribute to sleep and relaxation. It also improves blood circulation in your body which helps reduce and relieve muscular pains.',
      basePrice: '800',
      durationMinutes: 30,
      category: treatmentCategory,
    },
    {
      name: 'HERBAL COMPRESS',
      description: '',
      basePrice: '800',
      durationMinutes: 60,
      category: treatmentCategory,
    },
    {
      name: 'AFTER SUN MASSAGE',
      description: '',
      basePrice: '1200',
      durationMinutes: 60,
      category: treatmentCategory,
    },
    {
      name: 'BODY SCRUB',
      description:
        'Skin scrub helps tighten pores and moisturize the skin. It removes old skin cells and stimulates new skin cells naturally. It reduces wrinkles and stimulates the blood circulation. The skin becomes brighter. With the fragrances of your choice such as rose, coconut, gold and pearl scrub cream.',
      basePrice: '1500',
      durationMinutes: 60,
      category: treatmentCategory,
    },

    // MASSAGE Services
    {
      name: 'THAI MASSAGE',
      description:
        'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      basePrice: '600',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'FOOT RELAXING MASSAGE',
      description:
        'Foot reflexology massage helps stimulate the functions of the organs, balance the body and relieve calf and foot pains.',
      basePrice: '600',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'ASIAN BLEND MASSAGE',
      description: '',
      basePrice: '850',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'BACK & SHOULDER MASSAGE',
      description: '',
      basePrice: '1000',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'INDIAN HEAD MASSAGE',
      description: '',
      basePrice: '1000',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'AROMA OIL MASSAGE',
      description: '',
      basePrice: '1200',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'WARM OIL MASSAGE',
      description:
        'Aromatherapy massage is a combination of oil massage and various massage techniques to reduce and relieve aches and to relieve stress due to work and daily routines. It increases blood and lymph circulation. This massage is special as it incorporates warm aroma oils of your choice. The essential oils help you feel relaxed, both body and mind.',
      basePrice: '1500',
      durationMinutes: 60,
      category: classicCategory,
    },
    {
      name: 'THAI MASSAGE',
      description:
        'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      basePrice: '1000',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'THAI & FOOT MASSAGE',
      description: '',
      basePrice: '1000',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'THAI MASSAGE & HERBAL COMPRESS',
      description: '',
      basePrice: '1200',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'THAI MASSAGE & AROMA OIL MASSAGE',
      description: 'Thai Massage and Aroma Oil Massage 2 hours for 1 person',
      basePrice: '1500',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'AROMA OIL & FOOT MASSAGE',
      description: '',
      basePrice: '1500',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'AROMA OIL & HERBAL COMPRESS',
      description: '',
      basePrice: '1500',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'AROMA OIL MASSAGE',
      description: '',
      basePrice: '2000',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'BODY SCRUB & AROMA OIL MASSAGE',
      description: 'Body Scrub and Aroma Oil Massage 2 hours for 1 person',
      basePrice: '2200',
      durationMinutes: 120,
      category: classicCategory,
    },
    {
      name: 'PACKAGE ONLY',
      description:
        'This is a placeholder service for packages that include sub-services which may not exist as standalone services. It is not meant to be booked directly.',
      basePrice: '0',
      durationMinutes: 0,
      category: onlyPackageCategory,
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
      const savedService = await serviceRepo.save(service);

      // Create translations separately
      const translation = translationRepo.create({
        service: savedService,
        languageCode: 'en',
        name: serviceData.name,
        description: serviceData.description,
      });
      await translationRepo.save(translation);
      console.log(`Service '${serviceData.name}' seeded successfully`);
    } else {
      console.log(`Service '${serviceData.name}' already exists`);
    }
  }
}
