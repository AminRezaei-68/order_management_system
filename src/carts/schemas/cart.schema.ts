import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CartItem, CartItemSchema } from './cart-item.schema';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [{ type: [CartItemSchema], default: [] }],
  })
  items: CartItem[];
}

export type CartDocument = Cart & Document;

export const CartSchema = SchemaFactory.createForClass(Cart);
