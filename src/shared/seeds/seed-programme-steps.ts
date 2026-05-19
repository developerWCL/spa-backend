import { dataSource } from '../../config/typeorm';
import { ProgrammeStep } from '../../entities/programmes_step.entity';
import { Programme } from '../../entities/programmes.entity';
import { ProgrammeStepTranslation } from 'src/entities/programme_step_translation.entity';

export async function seedProgrammeSteps() {
  const programmeStepRepo = dataSource.getRepository(ProgrammeStep);
  const programmeRepo = dataSource.getRepository(Programme);
  const translationRepo = dataSource.getRepository(ProgrammeStepTranslation);

  const programmes = await programmeRepo.find({ relations: ['branch'] });

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
    {
      programmeName: '30-Day Wellness Programme',
      steps: [
        {
          title: 'Week 1: Foundation & Assessment',
          description: 'Health assessment and wellness baseline establishment',
          duration: 90,
        },
        {
          title: 'Week 2: Detoxification Phase',
          description: 'Deep cleansing and detoxification treatments',
          duration: 120,
        },
        {
          title: 'Week 3: Rejuvenation Phase',
          description: 'Body and facial rejuvenation therapies',
          duration: 120,
        },
        {
          title: 'Week 4: Integration & Balance',
          description: 'Final treatments and wellness maintenance plan',
          duration: 90,
        },
      ],
    },
    {
      programmeName: 'Stress Relief Programme',
      steps: [
        {
          title: 'Day 1: Stress Assessment',
          description: 'Initial consultation and stress level evaluation',
          duration: 60,
        },
        {
          title: 'Day 2-4: Therapy Sessions',
          description: 'Intensive massage and relaxation therapy sessions',
          duration: 90,
        },
        {
          title: 'Day 5: Recovery & Closure',
          description: 'Final relaxation and wellness maintenance guidance',
          duration: 60,
        },
      ],
    },
    {
      programmeName: 'Thai Wellness 5-Day Retreat',
      steps: [
        {
          title: 'Day 1: Thai Wellness Orientation',
          description: 'Introduction to traditional Thai wellness practices',
          duration: 75,
        },
        {
          title: 'Day 2-4: Thai Massage & Aromatherapy',
          description:
            'Daily Thai massage combined with aromatherapy treatments',
          duration: 120,
        },
        {
          title: 'Day 5: Reflection & Departure',
          description: 'Final relaxation session and wellness recommendations',
          duration: 90,
        },
      ],
    },
    {
      programmeName: '10-Day Facial Beauty Programme',
      steps: [
        {
          title: 'Days 1-2: Skin Analysis',
          description:
            'Comprehensive skin analysis and personalized beauty plan',
          duration: 90,
        },
        {
          title: 'Days 3-8: Intensive Facial Care',
          description:
            'Daily intensive facial treatments and skincare therapies',
          duration: 120,
        },
        {
          title: 'Days 9-10: Polish & Results',
          description: 'Final treatments and results evaluation',
          duration: 90,
        },
      ],
    },
    {
      programmeName: '7-Day Relaxation Escape',
      steps: [
        {
          title: 'Day 1: Welcome & Assessment',
          description: 'Welcome session and relaxation preference assessment',
          duration: 60,
        },
        {
          title: 'Days 2-6: Daily Relaxation',
          description: 'Daily massage and aromatherapy relaxation treatments',
          duration: 120,
        },
        {
          title: 'Day 7: Blissful Closure',
          description: 'Final luxurious treatment and departure',
          duration: 90,
        },
      ],
    },
    {
      programmeName: '14-Day Full Body Transformation',
      steps: [
        {
          title: 'Week 1: Foundation & Cleansing',
          description: 'Body assessment and deep cleansing treatments',
          duration: 120,
        },
        {
          title: 'Week 2: Transformation & Enhancement',
          description: 'Body treatments and facial enhancements',
          duration: 120,
        },
      ],
    },
    {
      programmeName: 'Deep Recovery 7-Day Programme',
      steps: [
        {
          title: 'Day 1: Assessment & Treatment Plan',
          description: 'Muscle assessment and personalized recovery plan',
          duration: 90,
        },
        {
          title: 'Days 2-6: Deep Tissue Therapy',
          description:
            'Daily intensive deep tissue massage and recovery therapy',
          duration: 120,
        },
        {
          title: 'Day 7: Final Recovery & Wellness',
          description: 'Final treatment and recovery maintenance guidance',
          duration: 90,
        },
      ],
    },
    {
      programmeName: 'Holistic Wellness 10-Day Journey',
      steps: [
        {
          title: 'Days 1-2: Holistic Assessment',
          description: 'Complete wellness assessment and energy evaluation',
          duration: 90,
        },
        {
          title: 'Days 3-8: Therapeutic Journey',
          description:
            'Daily holistic therapies, chakra balancing, and shiatsu',
          duration: 120,
        },
        {
          title: 'Days 9-10: Integration & Balance',
          description: 'Final integration session and wellness plan',
          duration: 90,
        },
      ],
    },
    {
      programmeName: 'Premium Healing 14-Day Retreat',
      steps: [
        {
          title: 'Week 1: Premium Assessment & Healing',
          description:
            'Comprehensive assessment and premium healing initiation',
          duration: 150,
        },
        {
          title: 'Week 2: Deep Healing & Transformation',
          description:
            'Intensive premium therapies and transformation treatments',
          duration: 150,
        },
      ],
    },
    {
      programmeName: 'Couples Romance 7-Day Escape',
      steps: [
        {
          title: 'Day 1: Romantic Welcome',
          description: 'Couples welcome session and romantic spa orientation',
          duration: 75,
        },
        {
          title: 'Days 2-6: Couples Therapy',
          description: 'Daily couples massage and romantic spa treatments',
          duration: 120,
        },
        {
          title: 'Day 7: Romantic Finale',
          description: 'Final romantic treatment and departure',
          duration: 90,
        },
      ],
    },
  ];

  for (const config of stepsConfig) {
    const matchingProgrammes = await programmeRepo.find({
      where: { name: config.programmeName },
    });

    for (const programme of matchingProgrammes) {
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
          console.log(
            `Programme step '${stepData.title}' created for programme '${config.programmeName}'`,
          );
        } else {
          console.log(
            `Programme step '${stepData.title}' already exists for programme '${config.programmeName}'`,
          );
        }
      }
    }
  }
}
