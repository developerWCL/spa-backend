import { dataSource } from '../../config/typeorm';
import { Payment } from '../../entities/payments.entity';
import { Booking } from '../../entities/bookings.entity';
import { PaymentStatus, PaymentType } from '../../entities/enums/booking.enum';

export async function seedPayments() {
  const paymentRepo = dataSource.getRepository(Payment);
  const bookingRepo = dataSource.getRepository(Booking);

  const bookings = await bookingRepo.find({ take: 3 });

  if (!bookings.length) {
    console.log('No bookings found. Please run seed-bookings first.');
    return;
  }

  for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    const existingPayment = await paymentRepo.findOne({
      where: { booking: { id: booking.id } },
    });

    if (!existingPayment) {
      const paymentType = [
        PaymentType.ON_ARRIVAL,
        PaymentType.CREDIT_CARD,
        PaymentType.BANK_TRANSFER,
      ][i];
      const paymentStatus = [
        PaymentStatus.PAID,
        PaymentStatus.PENDING,
        PaymentStatus.FAILED,
      ][i];

      // const payment = paymentRepo.create({
      //   booking,
      //   paymentType: paymentType as string,
      //   amount: booking.totalAmount,
      //   status: paymentStatus,
      // });
      // await paymentRepo.save(payment);
      console.log(`Payment created for booking '${booking.id}'`);
    }
  }
}
