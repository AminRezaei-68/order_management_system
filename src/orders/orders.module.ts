import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, orderSchema } from './schemas/order.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => ProductsModule),
    MongooseModule.forFeature([{ name: Order.name, schema: orderSchema }]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
