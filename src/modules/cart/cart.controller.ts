import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  CreateCartDto,
  UpdateCartDto,
  AddToCartDto,
  UpdateCartItemDto,
} from './cart.types';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerJwtAuthGuard } from 'src/guards/customer-jwt.guard';

@Controller('carts')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(CustomerJwtAuthGuard)
  @ApiOperation({ summary: 'Create a new cart for customer' })
  async createCart(@Req() request: any, @Body() dto: CreateCartDto) {
    console.log('Create cart - Request customer:', request.customer);
    const customerId = request.customer?.sub || request.customer?.id;
    if (!customerId) {
      throw new Error('Customer ID not found in request');
    }
    return this.cartService.createCart(customerId, dto);
  }

  @Get('customer/active')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiOperation({ summary: 'Get active cart for logged-in customer' })
  async getCustomerCart(@Req() request: any) {
    console.log('Get customer cart - Request customer:', request.customer);
    const customerId = request.customer?.sub || request.customer?.id;
    if (!customerId) {
      throw new Error('Customer ID not found in request');
    }
    const cart = await this.cartService.getCustomerCart(customerId);
    if (!cart) {
      return { message: 'No active cart found' };
    }
    return cart;
  }

  @Get(':cartId')
  @ApiOperation({ summary: 'Get cart by ID' })
  async getCart(@Param('cartId') cartId: string) {
    return this.cartService.getCart(cartId);
  }

  @Post(':cartId/items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@Param('cartId') cartId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(cartId, dto);
  }

  @Put(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Update cart item' })
  async updateItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(cartId, itemId, dto);
  }

  @Delete(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(cartId, itemId);
  }

  @Put(':cartId')
  @ApiOperation({ summary: 'Update cart' })
  async updateCart(
    @Param('cartId') cartId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCart(cartId, dto);
  }

  @Delete(':cartId/clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  async clearCart(@Param('cartId') cartId: string) {
    return this.cartService.clearCart(cartId);
  }

  @Delete(':cartId')
  @ApiOperation({ summary: 'Delete cart completely' })
  async deleteCart(@Param('cartId') cartId: string) {
    return this.cartService.deleteCart(cartId);
  }
}
