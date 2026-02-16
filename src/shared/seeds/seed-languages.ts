import { dataSource } from '../../config/typeorm';
import { Language } from '../../entities/language.entity';

export async function seedLanguages() {
  await dataSource.initialize();
  const languageRepo = dataSource.getRepository(Language);

  const languages = [
    {
      code: 'en',
      name: 'English',
      description: 'English language',
      isPrimary: true,
      isActive: true,
    },
    {
      code: 'th',
      name: 'Thai',
      description: 'Thai language',
      isPrimary: false,
      isActive: true,
    },
  ];

  for (const languageData of languages) {
    const existingLanguage = await languageRepo.findOne({
      where: { code: languageData.code },
    });

    if (!existingLanguage) {
      const language = languageRepo.create(languageData);
      await languageRepo.save(language);
      console.log(`Language '${languageData.name}' seeded successfully`);
    } else {
      console.log(`Language '${languageData.name}' already exists`);
    }
  }
}
