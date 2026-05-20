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
      bookingEngineUrl: 'https://orientalaspa.webconnection.app',
      status: 'active',
      metadata: {
        logo_url:
          'https://hotapp-io-core-bucket.s3.ap-southeast-7.amazonaws.com/services/02e03f30-1210-4a24-8870-4edcad2ebf7d/service-image-1-1778657627665.jpg',
        white_logo_url:
          'https://hotapp-io-core-bucket.s3.ap-southeast-7.amazonaws.com/services/627e5487-0683-478b-a289-25fdbe29e77a/service-image-1-1778135189365.jpg',
        banner_url: 'https://example.com/banner.png',
        primary_color: '#245743',
      },
    },
    {
      companyId: 'f8b410aa-b93b-427c-b1ce-e3b1de13ddfd',
      companyName: 'Web Connection',
      billingEmail: 'billing@webconnection.asia',
      name: 'Web Connection Spa',
      phone: '+66-2-123-4567',
      email: 'contact@webconnection.asia',
      website: 'https://webconnection.asia',
      bookingEngineUrl: 'https://spa.webconnection.app',
      status: 'active',
      metadata: {
        logo_url:
          'https://hotapp-io-core-bucket.s3.ap-southeast-7.amazonaws.com/services/0ebdba15-bd64-4320-b873-6f4b003fbf4f/service-image-1-1779161430643.jpg',
        white_logo_url:
          'https://hotapp-io-core-bucket.s3.ap-southeast-7.amazonaws.com/services/0ebdba15-bd64-4320-b873-6f4b003fbf4f/service-image-1-1779161430643.jpg',
        banner_url: 'https://example.com/banner.png',
        primary_color: '#00CC66',
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
