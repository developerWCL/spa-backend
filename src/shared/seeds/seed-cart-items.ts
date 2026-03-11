import { dataSource } from '../../config/typeorm';
import { CartItem } from '../../entities/cart_items.entity';
import { Cart } from '../../entities/cart.entity';
import { SubService } from '../../entities/sub_services.entity';
import { CartItemType } from '../../entities/enums/cart.enum';

export async function seedCartItems() {
  const cartItemRepo = dataSource.getRepository(CartItem);
  const cartRepo = dataSource.getRepository(Cart);
  const subServiceRepo = dataSource.getRepository(SubService);

  const carts = await cartRepo.find({ take: 2 });
  const subServices = await subServiceRepo.find({ take: 2 });

  if (!carts.length || !subServices.length) {
    console.log('No carts or sub-services found. Skipping cart items seed.');
    return;
  }

  for (let i = 0; i < carts.length && i < subServices.length; i++) {
    const cart = carts[i];
    const subService = subServices[i];

    const existingItem = await cartItemRepo.findOne({
      where: {
        cart: { id: cart.id },
        subService: { id: subService.id },
      },
    });

    if (!existingItem) {
      const cartItem = cartItemRepo.create({
        cart,
        subService,
        itemType: CartItemType.SUB_SERVICE,
        quantity: 1,
        price: subService.price,
        subtotal: subService.price,
      });
      await cartItemRepo.save(cartItem);
      console.log(
        `Cart item for sub-service '${subService.name}' added to customer's cart`,
      );
    }
  }
}
