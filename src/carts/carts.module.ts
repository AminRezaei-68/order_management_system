import { forwardRef, Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { UsersModule } from 'src/users/users.module';
import { Product, productSchema } from 'src/products/schemas/product.schema';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => OrdersModule),
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: productSchema },
    ]),
  ],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
