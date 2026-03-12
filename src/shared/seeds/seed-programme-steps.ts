import { dataSource } from '../../config/typeorm';
import { ProgrammeStep } from '../../entities/programmes_step.entity';
import { Programme } from '../../entities/programmes.entity';
import { ProgrammeStepTranslation } from 'src/entities/programme_step_translation.entity';

export async function seedProgrammeSteps() {
  const programmeStepRepo = dataSource.getRepository(ProgrammeStep);
  const programmeRepo = dataSource.getRepository(Programme);
  const translationRepo = dataSource.getRepository(ProgrammeStepTranslation);

  const programmes = await programmeRepo.find();

  if (!programmes.length) {
    console.log('No programmes found. Please run seed-programmes first.');
    return;
  }

  const stepsConfig = [
    {
      programmeName: '7-Day Detox Programme',
      steps: [
        {
          title: 'Day 1: Initial Assessment',
          description: 'Health assessment and detox plan setup',
          duration: 60,
        },
        {
          title: 'Day 2-3: Body Massage & Cleansing',
          description: 'Thai massage and herbal treatments',
          duration: 90,
        },
        {
          title: 'Day 4-5: Facial & Body Scrub',
          description: 'Deep cleansing facial and body treatments',
          duration: 120,
        },
        {
          title: 'Day 6-7: Relaxation & Recovery',
          description: 'Final relaxation and recovery treatments',
          duration: 90,
        },
      ],
    },
    {
      programmeName: '14-Day Beauty Programme',
      steps: [
        {
          title: 'Week 1: Skin Renewal',
          description: 'Intensive facial treatments and skincare',
          duration: 120,
        },
        {
          title: 'Week 2: Body Enhancement',
          description: 'Body treatments and beauty therapies',
          duration: 120,
        },
      ],
    },
  ];

  for (const config of stepsConfig) {
    const programme = programmes.find((p) => p.name === config.programmeName);

    if (!programme) {
      console.log(`Programme '${config.programmeName}' not found. Skipping...`);
      continue;
    }

    for (const stepData of config.steps) {
      const existingStep = await programmeStepRepo.findOne({
        where: {
          programme: { id: programme.id },
          title: stepData.title,
        },
      });

      if (!existingStep) {
        const step = programmeStepRepo.create({
          programme,
          title: stepData.title,
          description: stepData.description,
          duration: stepData.duration,
        });
        await programmeStepRepo.save(step);
        const translation = translationRepo.create({
          title: stepData.title,
          description: stepData.description,
          languageCode: 'en',
          programmeStep: step,
        });
        await translationRepo.save(translation);
        console.log(`Programme step '${stepData.title}' seeded successfully`);
      } else {
        console.log(`Programme step '${stepData.title}' already exists`);
      }
    }
  }
}
