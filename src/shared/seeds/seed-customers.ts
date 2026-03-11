import { dataSource } from '../../config/typeorm';
import { Customer } from '../../entities/customers.entity';
import { Spa } from '../../entities/spa.entity';
import { hashPassword } from '../../shared/password.util';

export async function seedCustomers() {
  const customerRepo = dataSource.getRepository(Customer);
  const spaRepo = dataSource.getRepository(Spa);

  const spa = await spaRepo.findOne({ where: {} });

  if (!spa) {
    console.log('No spa found. Please run seed-spa first.');
    return;
  }

  const customers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+66-81-234-5678',
      isVerified: true,
      loyaltyPoints: 500,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      phone: '+66-82-345-6789',
      isVerified: true,
      loyaltyPoints: 1000,
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      password: 'password123',
      phone: '+66-83-456-7890',
      isVerified: false,
      loyaltyPoints: 0,
    },
    {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.w@example.com',
      password: 'password123',
      phone: '+66-84-567-8901',
      isVerified: true,
      loyaltyPoints: 750,
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.b@example.com',
      password: 'password123',
      phone: '+66-85-678-9012',
      isVerified: true,
      loyaltyPoints: 2000,
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.d@example.com',
      password: 'password123',
      phone: '+66-86-789-0123',
      isVerified: false,
      loyaltyPoints: 100,
    },
  ];

  for (const customerData of customers) {
    const existingCustomer = await customerRepo.findOne({
      where: { email: customerData.email },
    });

    if (!existingCustomer) {
      const hashedPassword = await hashPassword(customerData.password);
      const customer = customerRepo.create({
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        password: hashedPassword,
        phone: customerData.phone,
        isVerified: customerData.isVerified,
        loyaltyPoints: customerData.loyaltyPoints,
        spa,
      });
      await customerRepo.save(customer);
      console.log(
        `Customer '${customerData.firstName} ${customerData.lastName}' seeded successfully`,
      );
    } else {
      console.log(`Customer '${customerData.email}' already exists`);
    }
  }
}
