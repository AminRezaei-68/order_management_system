/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/products/schemas/product.schema';
import { Order } from './schemas/order.schema';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(orderData, session) {
    if (!session) {
      throw new Error('Session is required for transactional operations');
    }
    const order = new this.orderModel(orderData);

    order.save({ session });
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const { offset = 0, limit = 10 } = paginationQueryDto;
    return await this.orderModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException(`Order with id ${id} does not exist.`);
    }

    return order;
  }

  async update(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const existingOrder = await this.orderModel.findById(id).exec();

    if (!existingOrder) {
      throw new NotFoundException(`Order with id ${id} does not exist.`);
    }

    existingOrder.status = updateOrderStatusDto.status;

    await existingOrder.save();
  }

  async remove(id: string) {
    const session = await this.orderModel.db.startSession();
    session.startTransaction();

    try {
      const order = await this.orderModel.findById(id).session(session).exec();

      if (!order) {
        throw new NotFoundException(`Order with id ${id} does not exist.`);
      }

      for (const item of order.items) {
        const product = await this.productModel
          .findById(item.productId)
          .session(session)
          .exec();

        if (!product) {
          throw new NotFoundException(
            `Product with id ${product.id} does not exist.`,
          );
        }

        product.quantity += item.quantity;

        await product.save({ session });
      }
      await order.deleteOne({ session });
      await session.commitTransaction();
      return { message: 'The order successfully deleted' };
    } catch (error) {
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
