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

  if (services.length === 0) {
    console.log('No services found. Please run seed-services first.');
    return;
  }

  // create sub-services for each service
  for (const service of services) {
    if (service.name === 'PACKAGE ONLY') {
      continue; // Skip creating sub-services for "PACKAGE ONLY" service
    }
    const subServiceName = `${service.durationMinutes} MINUTES`;

    let subService = await subServiceRepo.findOne({
      where: { name: subServiceName, service: { id: service.id } },
    });

    if (!subService) {
      subService = subServiceRepo.create({
        name: subServiceName,
        status: EntityStatus.ACTIVE,
        durationMinutes: service.durationMinutes,
        price: service.basePrice,
        onlyPackage: false,
        service, // associate with the parent service
      });
      subService = await subServiceRepo.save(subService);

      // Create translation for the sub-service
      const translation = translationRepo.create({
        name: subServiceName,
        description: '',
        languageCode: 'en',
        subService,
      });
      await translationRepo.save(translation);

      console.log(
        `Created sub-service '${subServiceName}' for service '${service.name}'`,
      );
    } else {
      console.log(
        `Sub-service '${subServiceName}' already exists for service '${service.name}'`,
      );
    }
  }
}
