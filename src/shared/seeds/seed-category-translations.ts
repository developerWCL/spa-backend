import { dataSource } from '../../config/typeorm';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { ServiceCategoryTranslation } from '../../entities/service_category_translations.entity';

export async function seedServiceCategoryTranslations() {
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const translationRepo = dataSource.getRepository(ServiceCategoryTranslation);

  // Get all service categories
  const categories = await categoryRepo.find();

  if (categories.length === 0) {
    console.log('No service categories found. Please seed categories first.');
    return;
  }

  // Define translations for each category
  const translationsMap: Record<string, Record<string, string>> = {
    TREATMENT: {
      en: 'Treatment',
      th: 'บำรุงรักษา',
    },
    'Classic Experience': {
      en: 'Classic Experience',
      th: 'ประสบการณ์คลาสสิก',
    },
    MASSAGE: {
      en: 'Massage',
      th: 'นวด',
    },
    'SIGNATURE PACKAGES': {
      en: 'Signature Packages',
      th: 'แพคเกจสุดพิเศษ',
    },
    'FACIAL MASSAGE': {
      en: 'Facial Massage',
      th: 'นวดหน้า',
    },
    'PACKAGE ONLY': {
      en: 'Package Only',
      th: 'เฉพาะแพคเกจ',
    },
    'Thai Massage': {
      en: 'Thai Massage',
      th: 'นวดแบบไทย',
    },
    'Relaxation Packages': {
      en: 'Relaxation Packages',
      th: 'แพคเกจผ่อนคลาย',
    },
    'Facial Care': {
      en: 'Facial Care',
      th: 'ดูแลผิวหน้า',
    },
    'Body Treatments': {
      en: 'Body Treatments',
      th: 'บำรุงรักษาร่างกาย',
    },
    'Wellness Services': {
      en: 'Wellness Services',
      th: 'บริการสุขภาพ',
    },
    'Deep Tissue Massage': {
      en: 'Deep Tissue Massage',
      th: 'นวดลึก',
    },
    'Premium Therapies': {
      en: 'Premium Therapies',
      th: 'บำรุงรักษาพรีเมียม',
    },
    'Couple Packages': {
      en: 'Couple Packages',
      th: 'แพคเกจสำหรับคู่รัก',
    },
  };

  for (const category of categories) {
    const translations = translationsMap[category.name];

    if (!translations) {
      console.log(`No translations found for category: ${category.name}`);
      continue;
    }

    for (const [languageCode, name] of Object.entries(translations)) {
      const existingTranslation = await translationRepo.findOne({
        where: {
          serviceCategory: { id: category.id },
          languageCode,
        },
      });

      if (!existingTranslation) {
        const translation = translationRepo.create({
          serviceCategory: category,
          languageCode,
          name,
          description: null,
        });
        await translationRepo.save(translation);
        console.log(
          `Created translation for ${category.name} (${languageCode}): ${name}`,
        );
      } else {
        console.log(
          `Translation already exists for ${category.name} (${languageCode})`,
        );
      }
    }
  }
}
