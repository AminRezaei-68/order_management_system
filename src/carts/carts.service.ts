/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart } from './schemas/cart.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateCartDto } from './dto/create-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';
import { Product } from 'src/products/schemas/product.schema';
import { DecrementItemDto } from './dto/decrement-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async checkValidityOfProduct(product, quantity) {
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (product.status.includes('Inactive')) {
      throw new BadRequestException('Product is not Active.');
    }

    if (product.quantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }
  }

  async checkCartAndProduct(cart, product) {
    if (!cart) {
      throw new NotFoundException(`The cart with id ${cart.cartId} not found.`);
    }

    if (!product) {
      throw new NotFoundException(
        `Product with id ${product.productId} not found.`,
      );
    }
  }

  async create(userId: string, createCartDto: CreateCartDto) {
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = new this.cartModel({ userId, items: [] });
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { productId, quantity } = createCartDto.items[0];

      const product = await this.productModel
        .findById(productId)
        .session(session);

      this.checkValidityOfProduct(product, quantity);

      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price: product.price });
      }

      product.quantity -= quantity;

      await cart.save({ session });
      await product.save({ session });

      await cart.save();
      await product.save();

      await session.commitTransaction();
      session.endSession();

      return cart;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async decrementItem(decrementItemDto: DecrementItemDto) {
    const session = await this.cartModel.db.startSession();

    try {
      session.startTransaction();

      const { cartId, productId } = decrementItemDto;
      const decrementAmount = 1;

      const cart = await this.cartModel.findById(cartId).session(session);
      const product = await this.productModel
        .findById(productId)
        .session(session);

      await this.checkCartAndProduct(cart, product);

      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId,
      );

      if (itemIndex === -1) {
        throw new NotFoundException(
          `Product with id ${productId} not found in the cart.`,
        );
      }

      const item = cart.items[itemIndex];

      if (item.quantity < decrementAmount) {
        throw new BadRequestException(
          `Cannot remove ${item.quantity} items. Only ${item.quantity} available in the cart.`,
        );
      }

      item.quantity -= decrementAmount;

      if (item.quantity === 0) {
        cart.items.splice(itemIndex, 1);
      }

      product.quantity += decrementAmount;

      await cart.save({ session });
      await product.save({ session });

      await session.commitTransaction();
      return cart;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeOne(decrementItemDto: DecrementItemDto) {
    const session = await this.cartModel.db.startSession();

    try {
      session.startTransaction();

      const { cartId, productId } = decrementItemDto;

      const cart = await this.cartModel.findById(cartId).session(session);
      const product = await this.productModel
        .findById(productId)
        .session(session);

      await this.checkCartAndProduct(cart, product);

      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId,
      );

      if (itemIndex === -1) {
        throw new NotFoundException(
          `Product with id ${productId} not found in the cart.`,
        );
      }

      const item = cart.items[itemIndex];

      product.quantity += item.quantity;

      cart.items.splice(itemIndex, 1);

      await cart.save({ session });
      await product.save({ session });

      await session.commitTransaction();
      return cart;
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removeAll(cartId: string) {
    const session = await this.cartModel.db.startSession();

    try {
      session.startTransaction();

      const cart = await this.cartModel.findById(cartId).session(session);

      if (!cart) {
        throw new NotFoundException(`The cart with id ${cartId} not found.`);
      }

      for (const item of cart.items) {
        const product = await this.productModel
          .findById(item.productId)
          .session(session);

        if (!product) {
          throw new NotFoundException(
            `Product with id ${item.productId} not found.`,
          );
        }

        product.quantity += item.quantity;
        await product.save({ session });
      }

      await this.cartModel.findByIdAndDelete(cartId);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
