import { dataSource } from '../../config/typeorm';
import { Package } from '../../entities/packages.entity';
import { Branch } from '../../entities/branch.entity';
import { EntityStatus } from '../../entities/enums/entity-status.enum';
import { PackageTranslation } from 'src/entities/package_translation.entity';
import { SubService } from '../../entities/sub_services.entity';
import { SubServiceTranslation } from 'src/entities/sub_service_translations.entity';
import { Service } from 'src/entities/services.entity';

export async function seedPackages() {
  const packageRepo = dataSource.getRepository(Package);
  const branchRepo = dataSource.getRepository(Branch);
  const translationRepo = dataSource.getRepository(PackageTranslation);
  const subServiceRepo = dataSource.getRepository(SubService);
  const serviceRepo = dataSource.getRepository(Service);
  const subServiceTranslationRepo = dataSource.getRepository(
    SubServiceTranslation,
  );

  const branch = await branchRepo.findOne({
    where: {
      name: 'Deevana Patong Resort & Spa',
    },
  });

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
      name: 'HOT & HERBS RITUAL',
      description:
        'This package is a combination of western spa massage with warm coconut oil and Thai fresh herbal compress, to relieve muscular tension and to increase blood circulation. You will feel refreshed after the massage. It is suitable for those who have pain and rigid muscles. It also helps reduce joint and muscle pains.',
      price: '2000',
      durationMinutes: 90,
      subServices: ['WARM OIL MASSAGE', 'HERBAL COMPRESS'],
    },
    {
      name: 'WELL-BEING',
      description:
        'It is believed that the spine and soles are the centre of energy in the human body. Thai massage focusing on the back and foot helps relax muscles due to fatigue from work, and helps stimulate the functions of our organs. This package is suitable for office workers and frequent travellers as it relaxes tension in the neck, shoulder, back and foot areas.',
      price: '1000',
      durationMinutes: 90,
      subServices: [
        'THAI BACK MASSAGE',
        'FOOT MASSAGE',
        'HEAD & SHOULDER MASSAGE',
      ],
    },
    {
      name: 'BEST SELLER (TRIO)',
      description:
        'This package is very popular at our spa due to the combination of many types of massage in a limited time. It is a combination of Thai massage, oil massage and foot massage. It helps relieve muscle aches with Thai massage. Afterwards relax the muscles with oil massage using the essential oils of your choice. Foot massage helps adjust the physical balance and relieve calf muscle pain.',
      price: '1700',
      durationMinutes: 120,
      subServices: ['THAI MASSAGE', 'AROMA OIL MASSAGE', 'FOOT MASSAGE'],
    },
    {
      name: 'BLISSFULL',
      description:
        'Nourish your skin starting with the scrub to remove dry, dead skin cells including dirt from the surface of the skin. It smooths your skin, reduces wrinkles and dull skin and reduces cellulite. Next, reduce tension in your muscles with Thai massage and relax your body and mind with the fragrances of essential oils of your choice.',
      price: '2500',
      durationMinutes: 150,
      subServices: ['BODY SCRUB', 'THAI MASSAGE', 'AROMA OIL MASSAGE'],
    },
    {
      name: 'DELIGHT',
      description: '',
      price: '2800',
      durationMinutes: 150,
      subServices: ['BODY SCRUB', 'AROMA OIL MASSAGE', 'FACIAL MASSAGE'],
    },
    {
      name: 'SWEET LOVER (1 PAX)',
      description:
        'For 1 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays. Therefore, gold is applied as a mixture in various costly cosmetics for the benefit of skin youth and rejuvenation.',
      price: '3000',
      durationMinutes: 150,
      subServices: ['BODY SCRUB', 'AROMA OIL MASSAGE', 'MILK BATH'],
    },
    {
      name: 'SWEET LOVER (COUPLE)',
      description:
        'For 2 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays. Therefore, gold is applied as a mixture in various costly cosmetics for the benefit of skin youth and rejuvenation.',
      price: '5000',
      durationMinutes: 150,
      subServices: ['BODY SCRUB', 'AROMA OIL MASSAGE', 'MILK BATH'],
    },
    {
      name: 'EXPRESS FACIAL',
      description: '',
      price: '500',
      durationMinutes: 30,
      subServices: [
        'EYE & LIP REMOVER',
        'DEEP CLEANSING CREAM',
        'FACIAL MASSAGE WITH MILKY CREAM',
        'GENTLE TONIFYING LOTION',
        'GENTLE SOOTHING CREAM',
      ],
    },
    {
      name: 'LIFT AND NOURISH',
      description: '',
      price: '700',
      durationMinutes: 45,
      subServices: [
        'EYE & LIP REMOVER',
        'DEEP CLEANSING CREAM',
        'FACIAL MASSAGE WITH MILKY CREAM',
        'GENTLE SOOTHING MASK',
        'WATER ROSE TONIFYING LOTION',
        'GENTLE SOOTHING CREAM',
        'BACK AND SHOULDER MASSAGE',
      ],
    },
    {
      name: 'RENEWAL FACIAL MASSAGE',
      description: '',
      price: '1000',
      durationMinutes: 60,
      subServices: [
        'EYE & LIP REMOVER',
        'DEEP CLEANSING FACIAL',
        'MILKY CREAM EXFOLIATOR',
        'FACIAL MASSAGE WITH MILKY CREAM',
        'GENTLE SOOTHING MASK',
        'WATER ROSE TONIFYING LOTION',
        'GENTLE SOOTHING CREAM',
        'BACK AND SHOULDER MASSAGE',
      ],
    },
  ];

  for (const packageData of packages) {
    const existingPackage = await packageRepo.findOne({
      where: { name: packageData.name, branch: { id: branch.id } },
    });

    let pkg: Package;
    if (!existingPackage) {
      pkg = packageRepo.create({
        name: packageData.name,
        price: packageData.price,
        branch,
        status: EntityStatus.ACTIVE,
        startDate: today,
        endDate: nextYear,
        subServices: [], // Initialize as empty array
      });
      pkg = await packageRepo.save(pkg);

      const translation = translationRepo.create({
        name: packageData.name,
        description: packageData.description,
        languageCode: 'en',
        package: pkg,
      });
      await translationRepo.save(translation);

      console.log(`Package '${packageData.name}' seeded successfully`);
    } else {
      pkg = existingPackage;
      console.log(`Package '${packageData.name}' already exists`);
    }

    // Reload package with its relations to get subServices array
    pkg = await packageRepo.findOne({
      where: { id: pkg.id },
      relations: ['subServices'],
    });
    if (!pkg.subServices) {
      pkg.subServices = [];
    }

    // Create or link sub-services for this package
    for (const subServiceName of packageData.subServices) {
      let subService = await subServiceRepo.findOne({
        where: {
          service: {
            name: subServiceName,
          },
          durationMinutes: parseInt(
            (
              packageData.durationMinutes / packageData.subServices.length
            ).toFixed(0),
          ), // Approximate duration for each sub-service
        },
      });
      let service = await serviceRepo.findOne({
        where: { name: subServiceName, branch: { id: branch.id } },
      });
      if (!service) {
        service = await serviceRepo.findOne({
          where: { name: 'PACKAGE ONLY', branch: { id: branch.id } },
        });
      }

      // If sub-service doesn't exist, create it with onlyPackage = true
      if (!subService) {
        subService = subServiceRepo.create({
          name: subServiceName,
          status: EntityStatus.ACTIVE,
          durationMinutes: parseInt(
            (
              packageData.durationMinutes / packageData.subServices.length
            ).toFixed(0),
          ), // Approximate duration for each sub-service
          onlyPackage: true,
          service, // associate with the parent service if it exists
        });
        subService = await subServiceRepo.save(subService);

        // Create translation for the new sub-service
        const subServiceTranslation = subServiceTranslationRepo.create({
          name: subServiceName,
          description: '',
          languageCode: 'en',
          subService,
        });
        await subServiceTranslationRepo.save(subServiceTranslation);

        console.log(
          `Created sub-service '${subServiceName}' with onlyPackage=true`,
        );
      }

      // Link sub-service to package if not already linked
      const alreadyLinked = pkg.subServices.some((s) => s.id === subService.id);
      if (!alreadyLinked) {
        pkg.subServices.push(subService);
      }
    }

    // Save all sub-service links at once
    if (pkg.subServices.length > 0) {
      await packageRepo.save(pkg);
      console.log(
        `Linked ${pkg.subServices.length} sub-services to package '${packageData.name}'`,
      );
    }
  }
}
