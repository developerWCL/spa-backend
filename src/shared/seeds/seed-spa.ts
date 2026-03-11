import { dataSource } from '../../config/typeorm';
import { Spa } from '../../entities/spa.entity';

export async function seedSpa() {
  const spaRepo = dataSource.getRepository(Spa);

  const spas = [
    {
      companyId: '550e8400-e29b-41d4-a716-446655440000',
      companyName: 'Orientala Wellness Group',
      billingEmail: 'billing@orientala-spa.com',
      name: 'Orientala Spa',
      phone: '+66-2-123-4567',
      email: 'contact@orientala-spa.com',
      website: 'https://orientala-spa.com',
      status: 'active',
      metadata: {
        logo_url:
          'https://hotapp-io-core-bucket.s3.ap-southeast-7.amazonaws.com/services/5ccc3391-9278-4318-99b2-7e2b3e12c3f0/programme-image-1-1771913651271.jpg',
        banner_url: 'https://example.com/banner.png',
        primary_color: '#245743',
      },
    },
  ];

  for (const spaData of spas) {
    const existingSpa = await spaRepo.findOne({
      where: { name: spaData.name },
    });

    if (!existingSpa) {
      const spa = spaRepo.create(spaData);
      await spaRepo.save(spa);
      console.log(`Spa '${spaData.name}' seeded successfully`);
    } else {
      console.log(`Spa '${spaData.name}' already exists`);
    }
  }
}
