import { dataSource } from '../../config/typeorm';
import { Booking } from '../../entities/bookings.entity';
import { BookingItem } from '../../entities/booking_items.entity';
import { Customer } from '../../entities/customers.entity';
import { Branch } from '../../entities/branch.entity';
import { Service } from '../../entities/services.entity';
import { Promotion } from '../../entities/promotions.entity';

import {
  BookingStatus,
  PaymentStatus,
} from '../../entities/enums/booking.enum';
import { CartItemType } from '../../entities/enums/cart.enum';

export async function seedBookings() {
  const bookingRepo = dataSource.getRepository(Booking);
  const bookingItemRepo = dataSource.getRepository(BookingItem);
  const customerRepo = dataSource.getRepository(Customer);
  const branchRepo = dataSource.getRepository(Branch);
  const serviceRepo = dataSource.getRepository(Service);
  const promotionRepo = dataSource.getRepository(Promotion);

  const customers = await customerRepo.find({ take: 3 });
  const branch = await branchRepo.findOne({ where: {} });
  const services = await serviceRepo.find({ take: 3 });
  const promotion = await promotionRepo.findOne({ where: {} });

  if (!customers.length || !branch || !services.length) {
    console.log(
      'Missing required data. Please run seed-customers, seed-branches, and seed-services first.',
    );
    return;
  }

  const bookingConfigs = [
    {
      customer: customers[0],
      services: [services[0], services[1]],
      totalAmount: (
        parseFloat(services[0].basePrice) + parseFloat(services[1].basePrice)
      ).toString(),
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      promotion: promotion || null,
    },
    {
      customer: customers[1],
      services: [services[2]],
      totalAmount: services[2].basePrice,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      promotion: null,
    },
    {
      customer: customers[2],
      services: [services[0]],
      totalAmount: services[0].basePrice,
      status: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      promotion: null,
    },
  ];

  for (const bookingConfig of bookingConfigs) {
    const existingBooking = await bookingRepo.findOne({
      where: {
        customer: { id: bookingConfig.customer.id },
        bookingTime: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
        ),
      },
    });

    if (!existingBooking) {
      // const booking = bookingRepo.create({
      //   customer: bookingConfig.customer,
      //   branch,
      //   promotion: bookingConfig.promotion,
      //   bookingTime: new Date(
      //     new Date().getFullYear(),
      //     new Date().getMonth(),
      //     new Date().getDate() + 1,
      //   ),
      //   status: bookingConfig.status,
      //   paymentStatus: bookingConfig.paymentStatus,
      //   totalAmount: bookingConfig.totalAmount,
      // });

      // const savedBooking = await bookingRepo.save(booking);

      // // Create booking items
      // for (const service of bookingConfig.services) {
      //   const bookingItem = bookingItemRepo.create({
      //     booking: savedBooking,
      //     subService: null,
      //     itemType: CartItemType.SUB_SERVICE,
      //     quantity: 1,
      //     price: service.basePrice,
      //     subtotal: service.basePrice,
      //   });
      //   await bookingItemRepo.save(bookingItem);
      // }

      console.log(
        `Booking created for customer '${bookingConfig.customer.email}' with ${bookingConfig.services.length} service(s)`,
      );
    }
  }
}
