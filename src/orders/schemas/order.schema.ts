import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CartItem, CartItemSchema } from 'src/carts/schemas/cart-item.schema';

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [CartItemSchema], required: true })
  items: CartItem[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: 'Pending' })
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

  @Prop()
  shippedAt?: Date;
}

export const orderSchema = SchemaFactory.createForClass(Order);
