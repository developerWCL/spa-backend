import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/entities/cart.entity';
import { CartItem } from 'src/entities/cart_items.entity';
import { Customer } from 'src/entities/customers.entity';
import { SubService } from 'src/entities/sub_services.entity';
import { Package } from 'src/entities/packages.entity';
import { Programme } from 'src/entities/programmes.entity';
import {
  CreateCartDto,
  UpdateCartDto,
  AddToCartDto,
  UpdateCartItemDto,
} from './cart.types';
import { CartStatus, CartItemType } from 'src/entities/enums/cart.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(SubService)
    private subServiceRepo: Repository<SubService>,
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
    @InjectRepository(Programme)
    private programmeRepo: Repository<Programme>,
  ) {}

  async createCart(customerId: string, dto: CreateCartDto): Promise<Cart> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const cart = new Cart();
    cart.customer = customer;
    cart.status = CartStatus.ACTIVE;
    cart.notes = dto.notes;
    cart.totalPrice = '0';
    cart.itemsCount = 0;

    const savedCart = await this.cartRepo.save(cart);

    if (dto.items && dto.items.length > 0) {
      for (const itemDto of dto.items) {
        await this.addItem(savedCart.id, itemDto);
      }
    }

    return this.getCart(savedCart.id);
  }

  async getCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: [
        'customer',
        'items',
        'items.subService',
        'items.subService.service',
        'items.subService.service.media',
        'items.subService.service.branch',
        'items.package',
        'items.package.media',
        'items.package.branch',
        'items.programme',
        'items.programme.media',
        'items.programme.branch',
        'items.programme.steps',
      ],
      order: {
        createdAt: 'DESC',
        items: {
          subService: {
            service: {
              media: {
                createdAt: 'ASC',
              },
            },
          },
          package: {
            media: {
              createdAt: 'ASC',
            },
          },
          programme: {
            media: {
              createdAt: 'ASC',
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    console.log('cart', cart);

    return cart;
  }

  async getCustomerCart(customerId: string): Promise<Cart | null> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const cart = await this.cartRepo.findOne({
      where: { customer: { id: customerId }, status: CartStatus.ACTIVE },
      relations: [
        'customer',
        'items',
        'items.subService',
        'items.subService.service',
        'items.subService.service.media',
        'items.subService.service.branch',
        'items.package',
        'items.package.media',
        'items.package.branch',
        'items.programme',
        'items.programme.media',
        'items.programme.branch',
        'items.programme.steps',
      ],
      order: {
        createdAt: 'DESC',
        items: {
          subService: {
            service: {
              media: {
                createdAt: 'ASC',
              },
            },
          },
          package: {
            media: {
              createdAt: 'ASC',
            },
          },
          programme: {
            media: {
              createdAt: 'ASC',
            },
          },
        },
      },
    });

    return cart || null;
  }

  async addItem(cartId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot add items to a ${cart.status} cart`,
      );
    }

    let price: string = '0';
    const item = new CartItem();
    item.cart = cart;
    item.itemType = dto.itemType;
    item.quantity = dto.quantity || 1;
    item.scheduledDate = dto.scheduledDate;
    item.notes = dto.notes;

    switch (dto.itemType) {
      case CartItemType.SUB_SERVICE:
        if (!dto.subServiceId) {
          throw new BadRequestException(
            'subServiceId is required for SUB_SERVICE items',
          );
        } else {
          const subService = await this.subServiceRepo.findOne({
            where: { id: dto.subServiceId },
          });
          if (!subService) {
            throw new NotFoundException(
              `SubService with ID ${dto.subServiceId} not found`,
            );
          }
          item.subService = subService;
          price = subService.price || '0';
        }
        break;

      case CartItemType.PACKAGE:
        if (!dto.packageId) {
          throw new BadRequestException(
            'packageId is required for PACKAGE items',
          );
        } else {
          const packageItem = await this.packageRepo.findOne({
            where: { id: dto.packageId },
          });
          if (!packageItem) {
            throw new NotFoundException(
              `Package with ID ${dto.packageId} not found`,
            );
          }
          item.package = packageItem;
          price = packageItem.price || '0';
        }
        break;

      case CartItemType.PROGRAMME:
        if (!dto.programmeId) {
          throw new BadRequestException(
            'programmeId is required for PROGRAMME items',
          );
        } else {
          const programme = await this.programmeRepo.findOne({
            where: { id: dto.programmeId },
          });
          if (!programme) {
            throw new NotFoundException(
              `Programme with ID ${dto.programmeId} not found`,
            );
          }
          item.programme = programme;
          price = programme.price || '0';
        }
        break;
    }

    item.price = price;
    item.subtotal = (parseFloat(price) * item.quantity).toString();

    await this.cartItemRepo.save(item);

    await this.updateCartTotals(cartId);

    return this.getCart(cartId);
  }

  async updateItem(
    cartId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cartItem = await this.cartItemRepo.findOne({
      where: { id: itemId, cart: { id: cartId } },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with ID ${itemId} not found in cart ${cartId}`,
      );
    }

    if (dto.quantity !== undefined) {
      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }
      cartItem.quantity = dto.quantity;
    }

    if (dto.scheduledDate !== undefined) {
      cartItem.scheduledDate = dto.scheduledDate;
    }

    if (dto.notes !== undefined) {
      cartItem.notes = dto.notes;
    }

    cartItem.subtotal = (
      parseFloat(cartItem.price || '0') * cartItem.quantity
    ).toString();

    await this.cartItemRepo.save(cartItem);

    await this.updateCartTotals(cartId);

    return this.getCart(cartId);
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const cartItem = await this.cartItemRepo.findOne({
      where: { id: itemId, cart: { id: cartId } },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with ID ${itemId} not found in cart ${cartId}`,
      );
    }

    await this.cartItemRepo.remove(cartItem);

    await this.updateCartTotals(cartId);

    return this.getCart(cartId);
  }

  async updateCart(cartId: string, dto: UpdateCartDto): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    if (dto.status !== undefined) {
      cart.status = dto.status;
    }

    if (dto.notes !== undefined) {
      cart.notes = dto.notes;
    }

    await this.cartRepo.save(cart);

    return this.getCart(cartId);
  }

  async clearCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    if (cart.items && cart.items.length > 0) {
      await this.cartItemRepo.remove(cart.items);
    }

    cart.totalPrice = '0';
    cart.itemsCount = 0;

    await this.cartRepo.save(cart);

    return this.getCart(cartId);
  }

  async deleteCart(cartId: string): Promise<{ message: string }> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    await this.cartRepo.remove(cart);

    return { message: `Cart with ID ${cartId} has been deleted` };
  }

  private async updateCartTotals(cartId: string): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      return;
    }

    let totalPrice = 0;
    const itemsCount = cart.items?.length || 0;

    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        totalPrice += parseFloat(item.subtotal || '0');
      }
    }

    cart.totalPrice = totalPrice.toString();
    cart.itemsCount = itemsCount;

    await this.cartRepo.save(cart);
  }
}
