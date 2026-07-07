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

  const branches = await branchRepo.find();

  if (!branches.length) {
    console.log('No branch found. Please run seed-branches first.');
    return;
  }

  // Define services for each branch
  const branchServicesConfig: {
    [branchName: string]: {
      name: string;
      description: string;
      basePrice: string;
      durationMinutes: number;
      categoryName: string;
    }[];
  } = {
    'Deevana Patong Resort & Spa': [
      // TREATMENT Services
      // {
      //   name: 'HERBAL STEAM',
      //   description: '',
      //   basePrice: '600',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BUBBLE BATH / MILK BATH',
      //   description:
      //     'The benefits of soaking in a 40 degree mineral milk bath contribute to sleep and relaxation. It also improves blood circulation in your body which helps reduce and relieve muscular pains.',
      //   basePrice: '800',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '800',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'AFTER SUN MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BODY SCRUB',
      //   description:
      //     'Skin scrub helps tighten pores and moisturize the skin. It removes old skin cells and stimulates new skin cells naturally. It reduces wrinkles and stimulates the blood circulation. The skin becomes brighter. With the fragrances of your choice such as rose, coconut, gold and pearl scrub cream.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // MASSAGE Services
      // {
      //   name: 'THAI MASSAGE',
      //   description:
      //     'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'FOOT RELAXING MASSAGE',
      //   description:
      //     'Foot reflexology massage helps stimulate the functions of the organs, balance the body and relieve calf and foot pains.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'ASIAN BLEND MASSAGE',
      //   description: '',
      //   basePrice: '850',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BACK & SHOULDER MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'INDIAN HEAD MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'WARM OIL MASSAGE',
      //   description:
      //     'Aromatherapy massage is a combination of oil massage and various massage techniques to reduce and relieve aches and to relieve stress due to work and daily routines. It increases blood and lymph circulation. This massage is special as it incorporates warm aroma oils of your choice. The essential oils help you feel relaxed, both body and mind.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE 2 HOURS',
      //   description:
      //     'Extended Thai massage session for 2 hours. Results in deeper relaxation and relief.',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & AROMA OIL MASSAGE',
      //   description: 'Thai Massage and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE 2 HOURS',
      //   description: '',
      //   basePrice: '2000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BODY SCRUB & AROMA OIL MASSAGE',
      //   description: 'Body Scrub and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '2200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        basePrice: '0',
        durationMinutes: 0,
        categoryName: 'PACKAGE ONLY',
      },
    ],
    'Patong Phuket': [
      // TREATMENT Services
      // {
      //   name: 'HERBAL STEAM',
      //   description: '',
      //   basePrice: '600',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BUBBLE BATH / MILK BATH',
      //   description:
      //     'The benefits of soaking in a 40 degree mineral milk bath contribute to sleep and relaxation. It also improves blood circulation in your body which helps reduce and relieve muscular pains.',
      //   basePrice: '800',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '800',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'AFTER SUN MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BODY SCRUB',
      //   description:
      //     'Skin scrub helps tighten pores and moisturize the skin. It removes old skin cells and stimulates new skin cells naturally. It reduces wrinkles and stimulates the blood circulation. The skin becomes brighter. With the fragrances of your choice such as rose, coconut, gold and pearl scrub cream.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // // MASSAGE Services
      // {
      //   name: 'THAI MASSAGE',
      //   description:
      //     'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'FOOT RELAXING MASSAGE',
      //   description:
      //     'Foot reflexology massage helps stimulate the functions of the organs, balance the body and relieve calf and foot pains.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'ASIAN BLEND MASSAGE',
      //   description: '',
      //   basePrice: '850',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BACK & SHOULDER MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'INDIAN HEAD MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'WARM OIL MASSAGE',
      //   description:
      //     'Aromatherapy massage is a combination of oil massage and various massage techniques to reduce and relieve aches and to relieve stress due to work and daily routines. It increases blood and lymph circulation. This massage is special as it incorporates warm aroma oils of your choice. The essential oils help you feel relaxed, both body and mind.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE 2 HOURS',
      //   description:
      //     'Extended Thai massage session for 2 hours. Results in deeper relaxation and relief.',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & AROMA OIL MASSAGE',
      //   description: 'Thai Massage and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE 2 HOURS',
      //   description: '',
      //   basePrice: '2000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BODY SCRUB & AROMA OIL MASSAGE',
      //   description: 'Body Scrub and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '2200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        basePrice: '0',
        durationMinutes: 0,
        categoryName: 'PACKAGE ONLY',
      },
    ],
    'Ramada by Wyndham Phuket Deevana Patong': [
      // TREATMENT Services
      // {
      //   name: 'HERBAL STEAM',
      //   description: '',
      //   basePrice: '600',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BUBBLE BATH / MILK BATH',
      //   description:
      //     'The benefits of soaking in a 40 degree mineral milk bath contribute to sleep and relaxation. It also improves blood circulation in your body which helps reduce and relieve muscular pains.',
      //   basePrice: '800',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '800',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'AFTER SUN MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BODY SCRUB',
      //   description:
      //     'Skin scrub helps tighten pores and moisturize the skin. It removes old skin cells and stimulates new skin cells naturally. It reduces wrinkles and stimulates the blood circulation. The skin becomes brighter. With the fragrances of your choice such as rose, coconut, gold and pearl scrub cream.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // // MASSAGE Services
      // {
      //   name: 'THAI MASSAGE',
      //   description:
      //     'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'FOOT RELAXING MASSAGE',
      //   description:
      //     'Foot reflexology massage helps stimulate the functions of the organs, balance the body and relieve calf and foot pains.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'ASIAN BLEND MASSAGE',
      //   description: '',
      //   basePrice: '850',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BACK & SHOULDER MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'INDIAN HEAD MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'WARM OIL MASSAGE',
      //   description:
      //     'Aromatherapy massage is a combination of oil massage and various massage techniques to reduce and relieve aches and to relieve stress due to work and daily routines. It increases blood and lymph circulation. This massage is special as it incorporates warm aroma oils of your choice. The essential oils help you feel relaxed, both body and mind.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE 2 HOURS',
      //   description:
      //     'Extended Thai massage session for 2 hours. Results in deeper relaxation and relief.',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & AROMA OIL MASSAGE',
      //   description: 'Thai Massage and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE 2 HOURS',
      //   description: '',
      //   basePrice: '2000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BODY SCRUB & AROMA OIL MASSAGE',
      //   description: 'Body Scrub and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '2200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        basePrice: '0',
        durationMinutes: 0,
        categoryName: 'PACKAGE ONLY',
      },
    ],
    'Deevana Plaza Phuket Patong': [
      // TREATMENT Services
      // {
      //   name: 'HERBAL STEAM',
      //   description: '',
      //   basePrice: '600',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BUBBLE BATH / MILK BATH',
      //   description:
      //     'The benefits of soaking in a 40 degree mineral milk bath contribute to sleep and relaxation. It also improves blood circulation in your body which helps reduce and relieve muscular pains.',
      //   basePrice: '800',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '800',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'AFTER SUN MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BODY SCRUB',
      //   description:
      //     'Skin scrub helps tighten pores and moisturize the skin. It removes old skin cells and stimulates new skin cells naturally. It reduces wrinkles and stimulates the blood circulation. The skin becomes brighter. With the fragrances of your choice such as rose, coconut, gold and pearl scrub cream.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // // MASSAGE Services
      // {
      //   name: 'THAI MASSAGE',
      //   description:
      //     'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'FOOT RELAXING MASSAGE',
      //   description:
      //     'Foot reflexology massage helps stimulate the functions of the organs, balance the body and relieve calf and foot pains.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'ASIAN BLEND MASSAGE',
      //   description: '',
      //   basePrice: '850',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BACK & SHOULDER MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'INDIAN HEAD MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'WARM OIL MASSAGE',
      //   description:
      //     'Aromatherapy massage is a combination of oil massage and various massage techniques to reduce and relieve aches and to relieve stress due to work and daily routines. It increases blood and lymph circulation. This massage is special as it incorporates warm aroma oils of your choice. The essential oils help you feel relaxed, both body and mind.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE 2 HOURS',
      //   description:
      //     'Extended Thai massage session for 2 hours. Results in deeper relaxation and relief.',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & AROMA OIL MASSAGE',
      //   description: 'Thai Massage and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE 2 HOURS',
      //   description: '',
      //   basePrice: '2000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BODY SCRUB & AROMA OIL MASSAGE',
      //   description: 'Body Scrub and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '2200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        basePrice: '0',
        durationMinutes: 0,
        categoryName: 'PACKAGE ONLY',
      },
    ],
    'Deevana Plaza Krabi Aonang': [
      // TREATMENT Services
      // {
      //   name: 'HERBAL STEAM',
      //   description: '',
      //   basePrice: '600',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BUBBLE BATH / MILK BATH',
      //   description:
      //     'The benefits of soaking in a 40 degree mineral milk bath contribute to sleep and relaxation. It also improves blood circulation in your body which helps reduce and relieve muscular pains.',
      //   basePrice: '800',
      //   durationMinutes: 30,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '800',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'AFTER SUN MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // {
      //   name: 'BODY SCRUB',
      //   description:
      //     'Skin scrub helps tighten pores and moisturize the skin. It removes old skin cells and stimulates new skin cells naturally. It reduces wrinkles and stimulates the blood circulation. The skin becomes brighter. With the fragrances of your choice such as rose, coconut, gold and pearl scrub cream.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'TREATMENT',
      // },
      // // MASSAGE Services
      // {
      //   name: 'THAI MASSAGE',
      //   description:
      //     'Thai massage results in health and relaxation. It incorporates pressure on lines and muscles throughout your body with the techniques of massage, pressure kneading and stretching to stimulate blood circulation, eliminate toxins, relieve tension and reduce muscle and joint pains. Oil is not applied, and customers are required to wear a massage outfit. This massage is suitable for those who like hard massage on the body lines.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'FOOT RELAXING MASSAGE',
      //   description:
      //     'Foot reflexology massage helps stimulate the functions of the organs, balance the body and relieve calf and foot pains.',
      //   basePrice: '600',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'ASIAN BLEND MASSAGE',
      //   description: '',
      //   basePrice: '850',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BACK & SHOULDER MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'INDIAN HEAD MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'WARM OIL MASSAGE',
      //   description:
      //     'Aromatherapy massage is a combination of oil massage and various massage techniques to reduce and relieve aches and to relieve stress due to work and daily routines. It increases blood and lymph circulation. This massage is special as it incorporates warm aroma oils of your choice. The essential oils help you feel relaxed, both body and mind.',
      //   basePrice: '1500',
      //   durationMinutes: 60,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE 2 HOURS',
      //   description:
      //     'Extended Thai massage session for 2 hours. Results in deeper relaxation and relief.',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'THAI MASSAGE & AROMA OIL MASSAGE',
      //   description: 'Thai Massage and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & FOOT MASSAGE',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL & HERBAL COMPRESS',
      //   description: '',
      //   basePrice: '1500',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'AROMA OIL MASSAGE 2 HOURS',
      //   description: '',
      //   basePrice: '2000',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      // {
      //   name: 'BODY SCRUB & AROMA OIL MASSAGE',
      //   description: 'Body Scrub and Aroma Oil Massage 2 hours for 1 person',
      //   basePrice: '2200',
      //   durationMinutes: 120,
      //   categoryName: 'Classic Experience',
      // },
      {
        name: 'PACKAGE ONLY',
        description: 'Package only',
        basePrice: '0',
        durationMinutes: 0,
        categoryName: 'PACKAGE ONLY',
      },
    ],
    // 'Web Connection Spa - Patong Branch': [
    //   {
    //     name: 'TRADITIONAL THAI MASSAGE',
    //     description:
    //       'Authentic traditional Thai massage using time-honored techniques passed down through generations.',
    //     basePrice: '500',
    //     durationMinutes: 60,
    //     categoryName: 'Thai Massage',
    //   },
    //   {
    //     name: 'AROMATHERAPY MASSAGE',
    //     description:
    //       'Relaxing massage with aromatic oils to relieve stress and promote wellness.',
    //     basePrice: '700',
    //     durationMinutes: 60,
    //     categoryName: 'Relaxation Packages',
    //   },
    //   {
    //     name: 'HOT STONE MASSAGE',
    //     description:
    //       'Therapeutic massage using heated stones to ease muscle tension and improve circulation.',
    //     basePrice: '800',
    //     durationMinutes: 90,
    //     categoryName: 'Relaxation Packages',
    //   },
    //   {
    //     name: 'SWEDISH MASSAGE',
    //     description:
    //       'Classic Swedish massage technique for full body relaxation and muscle relief.',
    //     basePrice: '650',
    //     durationMinutes: 60,
    //     categoryName: 'Relaxation Packages',
    //   },
    //   {
    //     name: 'FACIAL REJUVENATION',
    //     description:
    //       'Premium facial treatment with organic products to refresh and rejuvenate the skin.',
    //     basePrice: '900',
    //     durationMinutes: 60,
    //     categoryName: 'Facial Care',
    //   },
    //   {
    //     name: 'ANTI-AGING FACIAL',
    //     description:
    //       'Specialized anti-aging facial treatment targeting fine lines and skin elasticity.',
    //     basePrice: '1200',
    //     durationMinutes: 75,
    //     categoryName: 'Facial Care',
    //   },
    //   {
    //     name: 'BODY POLISH TREATMENT',
    //     description:
    //       'Exfoliating body treatment with natural scrub and nourishing oils.',
    //     basePrice: '1000',
    //     durationMinutes: 75,
    //     categoryName: 'Body Treatments',
    //   },
    //   {
    //     name: 'DETOX BODY WRAP',
    //     description:
    //       'Therapeutic body wrap treatment designed to detoxify and rejuvenate the skin.',
    //     basePrice: '950',
    //     durationMinutes: 60,
    //     categoryName: 'Body Treatments',
    //   },
    //   {
    //     name: 'COMBINATION PACKAGE - THAI & FACIAL',
    //     description:
    //       'Combined Thai massage and facial treatment for comprehensive wellness.',
    //     basePrice: '1500',
    //     durationMinutes: 120,
    //     categoryName: 'Relaxation Packages',
    //   },
    // ],
    // 'Web Connection Spa - Karon Branch': [
    //   {
    //     name: 'DEEP TISSUE THERAPY',
    //     description:
    //       'Intensive deep tissue massage focusing on chronic pain relief and muscle recovery.',
    //     basePrice: '750',
    //     durationMinutes: 60,
    //     categoryName: 'Deep Tissue Massage',
    //   },
    //   {
    //     name: 'THERAPEUTIC SPORTS MASSAGE',
    //     description:
    //       'Specialized massage for athletes targeting muscle performance and injury recovery.',
    //     basePrice: '850',
    //     durationMinutes: 75,
    //     categoryName: 'Deep Tissue Massage',
    //   },
    //   {
    //     name: 'HOLISTIC WELLNESS PACKAGE',
    //     description:
    //       'Comprehensive wellness treatment combining massage, reflexology, and energy healing.',
    //     basePrice: '1400',
    //     durationMinutes: 120,
    //     categoryName: 'Wellness Services',
    //   },
    //   {
    //     name: 'CHAKRA BALANCING THERAPY',
    //     description:
    //       'Energy healing therapy to balance chakras and promote overall wellness.',
    //     basePrice: '900',
    //     durationMinutes: 75,
    //     categoryName: 'Wellness Services',
    //   },
    //   {
    //     name: 'SHIATSU MASSAGE',
    //     description:
    //       'Japanese pressure point therapy to restore balance and relieve tension.',
    //     basePrice: '800',
    //     durationMinutes: 60,
    //     categoryName: 'Deep Tissue Massage',
    //   },
    //   {
    //     name: 'PREMIUM SPA EXPERIENCE',
    //     description:
    //       'Luxurious spa experience with multiple treatments including massage, facial, and body therapy.',
    //     basePrice: '2000',
    //     durationMinutes: 180,
    //     categoryName: 'Premium Therapies',
    //   },
    //   {
    //     name: 'SIGNATURE HEALING RITUAL',
    //     description:
    //       'Our signature treatment combining traditional and modern therapeutic techniques.',
    //     basePrice: '1600',
    //     durationMinutes: 120,
    //     categoryName: 'Premium Therapies',
    //   },
    //   {
    //     name: 'ROMANTIC COUPLE MASSAGE',
    //     description:
    //       'Side-by-side massage experience perfect for couples seeking relaxation together.',
    //     basePrice: '1800',
    //     durationMinutes: 120,
    //     categoryName: 'Couple Packages',
    //   },
    //   {
    //     name: 'COUPLES SPA RETREAT',
    //     description:
    //       'Full spa retreat for couples including massage, facial, and bath experience.',
    //     basePrice: '2500',
    //     durationMinutes: 180,
    //     categoryName: 'Couple Packages',
    //   },
    // ],
  };

  // Seed services for each branch
  for (const branch of branches) {
    const branchServices = branchServicesConfig[branch.name];

    if (!branchServices) {
      console.log(`No services config found for branch '${branch.name}'`);
      continue;
    }

    const serviceCategories = await categoryRepo.find({
      where: { branch: { id: branch.id } },
    });

    for (const serviceData of branchServices) {
      const category = serviceCategories.find(
        (c) => c.name === serviceData.categoryName,
      );

      if (!category) {
        console.log(
          `Category '${serviceData.categoryName}' not found for branch '${branch.name}'`,
        );
        continue;
      }

      const existingService = await serviceRepo.findOne({
        where: { name: serviceData.name, branch: { id: branch.id } },
      });

      if (!existingService) {
        const service = serviceRepo.create({
          name: serviceData.name,
          description: serviceData.description,
          basePrice: serviceData.basePrice,
          durationMinutes: serviceData.durationMinutes,
          category,
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
        console.log(
          `Service '${serviceData.name}' created for branch '${branch.name}'`,
        );
      } else {
        console.log(
          `Service '${serviceData.name}' already exists for branch '${branch.name}'`,
        );
      }
    }
  }
}
