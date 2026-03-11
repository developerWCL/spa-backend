import { dataSource } from '../../config/typeorm';
import { Cart } from '../../entities/cart.entity';
import { Customer } from '../../entities/customers.entity';
import { CartStatus } from '../../entities/enums/cart.enum';

export async function seedCarts() {
  const cartRepo = dataSource.getRepository(Cart);
  const customerRepo = dataSource.getRepository(Customer);

  const customers = await customerRepo.find();

  for (const customer of customers) {
    const existingCart = await cartRepo.findOne({
      where: { customer: { id: customer.id } },
    });

    if (!existingCart) {
      const cart = cartRepo.create({
        customer,
        status: CartStatus.ACTIVE,
        totalPrice: '0',
      });
      await cartRepo.save(cart);
      console.log(`Cart created for customer '${customer.email}'`);
    } else {
      console.log(`Cart already exists for customer '${customer.email}'`);
    }
  }
}
