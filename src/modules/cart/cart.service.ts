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
import { Guest } from 'src/entities/guests.entity';
import {
  CreateCartDto,
  UpdateCartDto,
  AddToCartDto,
  UpdateCartItemDto,
  GuestDto,
} from './cart.types';
import { CartStatus, CartItemType } from 'src/entities/enums/cart.enum';
import { EntityGuestGender } from 'src/entities/enums/entity-guest.enum';
import { EntityStatus } from 'src/entities/enums/entity-status.enum';
import { AppLoggerService } from 'src/core/logging/app-logger.service';

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
    @InjectRepository(Guest)
    private guestRepo: Repository<Guest>,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext('CartService');
  }

  async createCart(customerId: string, dto: CreateCartDto): Promise<Cart> {
    this.logger.log('Creating cart', { customerId });
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      this.logger.error('Customer not found', null, { customerId });
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

    this.logger.log('Cart created successfully', { cartId: savedCart.id });
    return this.getCart(savedCart.id);
  }

  async getCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: [
        'customer',
        'items',
        'items.guests',
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
      this.logger.error('Cart not found', null, { cartId });
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

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
        'items.guests',
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
      relations: ['customer', 'customer.spa'],
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
    item.scheduledTime = dto.scheduledTime;
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
          price = dto.price || subService.price || '0';
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
          price = dto.price || packageItem.price || '0';
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

    const savedItem = await this.cartItemRepo.save(item);

    // Handle guest creation or update
    if (dto.guests && dto.guests.length > 0) {
      const guests = await Promise.all(
        dto.guests.map((guestData) =>
          this.createOrUpdateGuest(guestData, cart.customer),
        ),
      );
      savedItem.guests = guests;
      await this.cartItemRepo.save(savedItem);
    }

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
      relations: ['cart', 'cart.customer', 'cart.customer.spa'],
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

    if (dto.subServiceId !== undefined) {
      const subService = await this.subServiceRepo.findOne({
        where: { id: dto.subServiceId },
      });
      if (!subService) {
        throw new NotFoundException(
          `SubService with ID ${dto.subServiceId} not found`,
        );
      }
      cartItem.subService = subService;
      cartItem.price = dto.price || subService.price || '0';
    }

    if (dto.packageId !== undefined) {
      const packageItem = await this.packageRepo.findOne({
        where: { id: dto.packageId },
      });
      if (!packageItem) {
        throw new NotFoundException(
          `Package with ID ${dto.packageId} not found`,
        );
      }
      cartItem.package = packageItem;
      cartItem.price = dto.price || packageItem.price || '0';
    }

    if (dto.programmeId !== undefined) {
      const programme = await this.programmeRepo.findOne({
        where: { id: dto.programmeId },
      });
      if (!programme) {
        throw new NotFoundException(
          `Programme with ID ${dto.programmeId} not found`,
        );
      }
      cartItem.programme = programme;
      cartItem.price = dto.price || programme.price || '0';
    }

    if (dto.scheduledDate !== undefined) {
      cartItem.scheduledDate = dto.scheduledDate;
    }

    if (dto.scheduledTime !== undefined) {
      cartItem.scheduledTime = dto.scheduledTime;
    }

    if (dto.notes !== undefined) {
      cartItem.notes = dto.notes;
    }

    cartItem.subtotal = (
      parseFloat(cartItem.price || '0') * cartItem.quantity
    ).toString();

    await this.cartItemRepo.save(cartItem);
    // Handle guest creation or update
    if (dto.guests && dto.guests.length > 0) {
      const guests = await Promise.all(
        dto.guests.map((guestData) =>
          this.createOrUpdateGuest(guestData, cartItem.cart.customer),
        ),
      );
      cartItem.guests = guests;
      await this.cartItemRepo.save(cartItem);
    }

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

  private async createOrUpdateGuest(
    guestData: GuestDto,
    customer: Customer,
  ): Promise<Guest> {
    // If guest ID is provided, update the existing guest
    if (guestData.id) {
      const guest = await this.guestRepo.findOne({
        where: { id: guestData.id },
      });

      if (!guest) {
        throw new NotFoundException(`Guest with ID ${guestData.id} not found`);
      }

      // Update guest fields
      if (guestData.firstName !== undefined) {
        guest.firstName = guestData.firstName;
      }
      if (guestData.lastName !== undefined) {
        guest.lastName = guestData.lastName;
      }
      if (guestData.email !== undefined) {
        guest.email = guestData.email;
      }
      if (guestData.phone !== undefined) {
        guest.phone = guestData.phone;
      }
      if (guestData.nationality !== undefined) {
        guest.nationality = guestData.nationality;
      }
      if (guestData.gender !== undefined) {
        guest.gender = guestData.gender.toLowerCase() as EntityGuestGender;
      }
      if (guestData.specialRequests !== undefined) {
        guest.specialRequest = guestData.specialRequests;
      }

      return await this.guestRepo.save(guest);
    }

    // Create new guest if ID is not provided
    const guest = new Guest();
    guest.firstName = guestData.firstName;
    guest.lastName = guestData.lastName;
    guest.email = guestData.email;
    guest.phone = guestData.phone || undefined;
    guest.nationality = guestData.nationality || undefined;
    guest.gender = guestData.gender
      ? (guestData.gender.toLowerCase() as EntityGuestGender)
      : undefined;
    guest.specialRequest = guestData.specialRequests || undefined;
    guest.spa = customer.spa;
    guest.customer = customer;

    return await this.guestRepo.save(guest);
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

  async getAvailableItems(
    serviceId: string,
    itemType: CartItemType,
    branchId: string,
  ): Promise<(SubService | Package | Programme)[]> {
    switch (itemType) {
      case CartItemType.SUB_SERVICE: {
        const data = await this.subServiceRepo.find({
          where: {
            id: serviceId,
            service: { status: EntityStatus.ACTIVE, branch: { id: branchId } },
            status: EntityStatus.ACTIVE,
          },
          relations: ['service', 'service.branch'],
        });
        if (!data || data.length === 0) {
          throw new NotFoundException(
            `No active sub-service found with ID ${serviceId} in branch ${branchId}`,
          );
        }
        return data;
      }

      case CartItemType.PACKAGE: {
        const data = await this.packageRepo.find({
          where: {
            id: serviceId,
            status: EntityStatus.ACTIVE,
            branch: { id: branchId },
          },
          relations: ['branch'],
        });
        if (!data || data.length === 0) {
          throw new NotFoundException(
            `No active package found with ID ${serviceId} in branch ${branchId}`,
          );
        }
        return data;
      }

      case CartItemType.PROGRAMME: {
        const data = await this.programmeRepo.find({
          where: {
            id: serviceId,
            status: EntityStatus.ACTIVE,
            branch: { id: branchId },
          },
          relations: ['branch'],
        });
        if (!data || data.length === 0) {
          throw new NotFoundException(
            `No active programme found with ID ${serviceId} in branch ${branchId}`,
          );
        }
        return data;
      }

      default:
        throw new BadRequestException('Invalid item type');
    }
  }
}
