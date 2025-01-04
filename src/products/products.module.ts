import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from './schemas/product.schema';
import { UsersModule } from '../users/users.module';
import { CartsModule } from '../carts/carts.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    UsersModule,
    CartsModule,
    OrdersModule,
    MongooseModule.forFeature([{ name: Product.name, schema: productSchema }]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}
