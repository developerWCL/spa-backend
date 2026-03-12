import { dataSource } from '../../config/typeorm';
import { SubService } from '../../entities/sub_services.entity';
import { Service } from '../../entities/services.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';
import { SubServiceTranslation } from 'src/entities/sub_service_translations.entity';

export async function seedSubServices() {
  const subServiceRepo = dataSource.getRepository(SubService);
  const serviceRepo = dataSource.getRepository(Service);
  const translationRepo = dataSource.getRepository(SubServiceTranslation);

  const services = await serviceRepo.find();

  const subServiceConfigs = [
    {
      serviceName: 'Thai Massage',
      subServices: [
        {
          name: 'Full Body Thai Massage',
          description: 'Complete body massage',
          duration: 60,
          price: '800',
        },
        {
          name: 'Upper Body Thai Massage',
          description: 'Upper body focus',
          duration: 30,
          price: '500',
        },
      ],
    },
    {
      serviceName: 'Swedish Massage',
      subServices: [
        {
          name: 'Classic Swedish Massage',
          description: 'Traditional Swedish technique',
          duration: 60,
          price: '900',
        },
      ],
    },
    {
      serviceName: 'Deep Tissue Massage',
      subServices: [
        {
          name: 'Full Body Deep Tissue',
          description: 'Full body deep tissue work',
          duration: 60,
          price: '1000',
        },
        {
          name: 'Targeted Deep Tissue',
          description: 'Problem area focus',
          duration: 45,
          price: '800',
        },
      ],
    },
    {
      serviceName: 'Hydrating Facial',
      subServices: [
        {
          name: 'Intensive Hydrating Facial',
          description: 'Deep moisture treatment',
          duration: 45,
          price: '700',
        },
      ],
    },
    {
      serviceName: 'Anti-Aging Facial',
      subServices: [
        {
          name: 'Premium Anti-Aging',
          description: 'Advanced anti-aging care',
          duration: 60,
          price: '1000',
        },
      ],
    },
  ];

  for (const config of subServiceConfigs) {
    const service = services.find((s) => s.name === config.serviceName);

    if (!service) {
      console.log(`Service '${config.serviceName}' not found. Skipping...`);
      continue;
    }

    for (const subServiceData of config.subServices) {
      const existingSubService = await subServiceRepo.findOne({
        where: { name: subServiceData.name },
      });

      if (!existingSubService) {
        const subService = subServiceRepo.create({
          name: subServiceData.name,
          durationMinutes: subServiceData.duration,
          price: subServiceData.price,
          service,
          status: EntityStatus.ACTIVE,
        });
        await subServiceRepo.save(subService);
        const translation = translationRepo.create({
          name: subServiceData.name,
          description: subServiceData.description,
          languageCode: 'en',
          subService,
        });
        await translationRepo.save(translation);
        console.log(`Sub-service '${subServiceData.name}' seeded successfully`);
      } else {
        console.log(`Sub-service '${subServiceData.name}' already exists`);
      }
    }
  }
}
