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

  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  const today = new Date();
  const nextYear = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  );

  // Define packages for each branch
  const branchPackagesConfig: {
    [branchName: string]: {
      name: string;
      description: string;
      price: string;
      durationMinutes: number;
      subServices: string[];
    }[];
  } = {
    'Deevana Patong Resort & Spa': [
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
        subServices: [
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE 2 HOURS',
          'FOOT RELAXING MASSAGE',
        ],
      },
      {
        name: 'BLISSFULL',
        description:
          'Nourish your skin starting with the scrub to remove dry, dead skin cells including dirt from the surface of the skin. It smooths your skin, reduces wrinkles and dull skin and reduces cellulite. Next, reduce tension in your muscles with Thai massage and relax your body and mind with the fragrances of essential oils of your choice.',
        price: '2500',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE',
        ],
      },
      {
        name: 'DELIGHT',
        description:
          'A luxurious combination of body rejuvenation and facial care treatments.',
        price: '2800',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'INDIAN HEAD MASSAGE',
        ],
      },
      {
        name: 'SWEET LOVER (1 PAX)',
        description:
          'For 1 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays.',
        price: '3000',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'BUBBLE BATH / MILK BATH',
        ],
      },
    ],
    'Patong Phuket': [
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
        subServices: [
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE 2 HOURS',
          'FOOT RELAXING MASSAGE',
        ],
      },
      {
        name: 'BLISSFULL',
        description:
          'Nourish your skin starting with the scrub to remove dry, dead skin cells including dirt from the surface of the skin. It smooths your skin, reduces wrinkles and dull skin and reduces cellulite. Next, reduce tension in your muscles with Thai massage and relax your body and mind with the fragrances of essential oils of your choice.',
        price: '2500',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE',
        ],
      },
      {
        name: 'DELIGHT',
        description:
          'A luxurious combination of body rejuvenation and facial care treatments.',
        price: '2800',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'INDIAN HEAD MASSAGE',
        ],
      },
      {
        name: 'SWEET LOVER (1 PAX)',
        description:
          'For 1 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays.',
        price: '3000',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'BUBBLE BATH / MILK BATH',
        ],
      },
    ],
    'Ramada by Wyndham Phuket Deevana Patong': [
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
        subServices: [
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE 2 HOURS',
          'FOOT RELAXING MASSAGE',
        ],
      },
      {
        name: 'BLISSFULL',
        description:
          'Nourish your skin starting with the scrub to remove dry, dead skin cells including dirt from the surface of the skin. It smooths your skin, reduces wrinkles and dull skin and reduces cellulite. Next, reduce tension in your muscles with Thai massage and relax your body and mind with the fragrances of essential oils of your choice.',
        price: '2500',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE',
        ],
      },
      {
        name: 'DELIGHT',
        description:
          'A luxurious combination of body rejuvenation and facial care treatments.',
        price: '2800',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'INDIAN HEAD MASSAGE',
        ],
      },
      {
        name: 'SWEET LOVER (1 PAX)',
        description:
          'For 1 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays.',
        price: '3000',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'BUBBLE BATH / MILK BATH',
        ],
      },
    ],
    'Deevana Plaza Phuket Patong': [
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
        subServices: [
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE 2 HOURS',
          'FOOT RELAXING MASSAGE',
        ],
      },
      {
        name: 'BLISSFULL',
        description:
          'Nourish your skin starting with the scrub to remove dry, dead skin cells including dirt from the surface of the skin. It smooths your skin, reduces wrinkles and dull skin and reduces cellulite. Next, reduce tension in your muscles with Thai massage and relax your body and mind with the fragrances of essential oils of your choice.',
        price: '2500',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE',
        ],
      },
      {
        name: 'DELIGHT',
        description:
          'A luxurious combination of body rejuvenation and facial care treatments.',
        price: '2800',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'INDIAN HEAD MASSAGE',
        ],
      },
      {
        name: 'SWEET LOVER (1 PAX)',
        description:
          'For 1 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays.',
        price: '3000',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'BUBBLE BATH / MILK BATH',
        ],
      },
    ],
    'Deevana Plaza Krabi Aonang': [
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
        subServices: [
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE 2 HOURS',
          'FOOT RELAXING MASSAGE',
        ],
      },
      {
        name: 'BLISSFULL',
        description:
          'Nourish your skin starting with the scrub to remove dry, dead skin cells including dirt from the surface of the skin. It smooths your skin, reduces wrinkles and dull skin and reduces cellulite. Next, reduce tension in your muscles with Thai massage and relax your body and mind with the fragrances of essential oils of your choice.',
        price: '2500',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'THAI MASSAGE 2 HOURS',
          'AROMA OIL MASSAGE',
        ],
      },
      {
        name: 'DELIGHT',
        description:
          'A luxurious combination of body rejuvenation and facial care treatments.',
        price: '2800',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'INDIAN HEAD MASSAGE',
        ],
      },
      {
        name: 'SWEET LOVER (1 PAX)',
        description:
          'For 1 Persons. Gold scrub helps gently exfoliate the skin, stimulates new skin cells, helps reduce dull skin and brightens the skin. Followed by the mineral milk bath which softens the skin and helps you feel relaxed. A massage with gold cream helps prevent skin inflammation caused by UV rays.',
        price: '3000',
        durationMinutes: 150,
        subServices: [
          'BODY SCRUB',
          'AROMA OIL MASSAGE 2 HOURS',
          'BUBBLE BATH / MILK BATH',
        ],
      },
    ],
    'Web Connection Spa - Patong Branch': [
      {
        name: 'THAI BLISS RITUAL',
        description:
          'Experience the authentic Thai massage combined with relaxing aromatherapy for ultimate tension relief and body rejuvenation.',
        price: '1200',
        durationMinutes: 120,
        subServices: ['TRADITIONAL THAI MASSAGE', 'AROMATHERAPY MASSAGE'],
      },
      {
        name: 'ULTIMATE RELAXATION PACKAGE',
        description:
          'A comprehensive relaxation treatment combining multiple therapies for complete body and mind rejuvenation.',
        price: '1600',
        durationMinutes: 150,
        subServices: [
          'HOT STONE MASSAGE',
          'AROMATHERAPY MASSAGE',
          'SWEDISH MASSAGE',
        ],
      },
      {
        name: 'FACIAL GLOW EXPERIENCE',
        description:
          'Transform your skin with our premium facial treatments designed to restore natural radiance and youthfulness.',
        price: '1400',
        durationMinutes: 120,
        subServices: [
          'FACIAL REJUVENATION',
          'ANTI-AGING FACIAL',
          'AROMATHERAPY MASSAGE',
        ],
      },
      {
        name: 'FULL BODY REJUVENATION',
        description:
          'Complete body care package with exfoliation, polish treatment, and therapeutic massage for total renewal.',
        price: '1800',
        durationMinutes: 150,
        subServices: [
          'BODY POLISH TREATMENT',
          'DETOX BODY WRAP',
          'SWEDISH MASSAGE',
        ],
      },
      {
        name: 'LUXURY SPA ESCAPE',
        description:
          'Our most comprehensive spa experience combining Thai massage, facial rejuvenation, and body treatments.',
        price: '2200',
        durationMinutes: 180,
        subServices: [
          'TRADITIONAL THAI MASSAGE',
          'FACIAL REJUVENATION',
          'BODY POLISH TREATMENT',
        ],
      },
    ],
    'Web Connection Spa - Karon Branch': [
      {
        name: 'DEEP RECOVERY THERAPY',
        description:
          'Intensive deep tissue massage therapy designed for muscle recovery and pain relief.',
        price: '1300',
        durationMinutes: 120,
        subServices: ['DEEP TISSUE THERAPY', 'THERAPEUTIC SPORTS MASSAGE'],
      },
      {
        name: 'WELLNESS HARMONY PACKAGE',
        description:
          'Holistic wellness treatment balancing body energy and promoting complete healing.',
        price: '1800',
        durationMinutes: 150,
        subServices: [
          'HOLISTIC WELLNESS PACKAGE',
          'CHAKRA BALANCING THERAPY',
          'SHIATSU MASSAGE',
        ],
      },
      {
        name: 'PREMIUM HEALING RITUAL',
        description:
          'Experience our signature premium therapies combining traditional and modern healing techniques.',
        price: '2100',
        durationMinutes: 150,
        subServices: [
          'PREMIUM SPA EXPERIENCE',
          'SIGNATURE HEALING RITUAL',
          'DEEP TISSUE THERAPY',
        ],
      },
      {
        name: 'ROMANTIC COUPLE ESCAPE',
        description:
          'Perfect couples experience with side-by-side massage and relaxation treatments.',
        price: '1900',
        durationMinutes: 120,
        subServices: ['ROMANTIC COUPLE MASSAGE', 'CHAKRA BALANCING THERAPY'],
      },
      {
        name: 'COUPLES LUXURY RETREAT',
        description:
          'Ultimate couples spa retreat with premium services and full spa experience.',
        price: '2800',
        durationMinutes: 180,
        subServices: [
          'COUPLES SPA RETREAT',
          'PREMIUM SPA EXPERIENCE',
          'SHIATSU MASSAGE',
        ],
      },
    ],
  };

  // Seed packages for each branch
  for (const branch of branches) {
    const branchPackages = branchPackagesConfig[branch.name];

    if (!branchPackages) {
      console.log(`No packages config found for branch '${branch.name}'`);
      continue;
    }

    for (const packageData of branchPackages) {
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

        console.log(
          `Package '${packageData.name}' created for branch '${branch.name}'`,
        );
      } else {
        pkg = existingPackage;
        console.log(
          `Package '${packageData.name}' already exists for branch '${branch.name}'`,
        );
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
          // Try to find a fallback service if exact name doesn't match
          service = await serviceRepo.findOne({
            where: { branch: { id: branch.id } },
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
            `Created sub-service '${subServiceName}' for branch '${branch.name}' with onlyPackage=true`,
          );
        }

        // Link sub-service to package if not already linked
        const alreadyLinked = pkg.subServices.some(
          (s) => s.id === subService.id,
        );
        if (!alreadyLinked) {
          pkg.subServices.push(subService);
        }
      }

      // Save all sub-service links at once
      if (pkg.subServices.length > 0) {
        await packageRepo.save(pkg);
        console.log(
          `Linked ${pkg.subServices.length} sub-services to package '${packageData.name}' for branch '${branch.name}'`,
        );
      }
    }
  }
}
