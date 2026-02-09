import { dataSource } from '../../config/typeorm';
import { ServiceCategory } from '../../entities/service_categories.entity';
import { ServiceCategoryTranslation } from '../../entities/service_category_translations.entity';

export async function seedServiceCategoryTranslations() {
  await dataSource.initialize();
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
    Massage: {
      en: 'Massage',
      th: 'นวด',
    },
    'Facial Treatment': {
      en: 'Facial Treatment',
      th: 'ปรับปรุงผิวหน้า',
    },
    'Body Treatment': {
      en: 'Body Treatment',
      th: 'บำรุงรักษาร่างกาย',
    },
    'Foot Care': {
      en: 'Foot Care',
      th: 'ดูแลเท้า',
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
