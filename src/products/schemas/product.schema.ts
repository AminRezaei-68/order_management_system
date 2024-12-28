import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: [String], required: true })
  category: string[];

  @Prop({ default: 0 })
  reservedQuantity: number;

  @Prop()
  brand?: string;

  @Prop({ type: [String], required: true })
  status: string[];
}

export type ProductDocument = Product & Document;

export const productSchema = SchemaFactory.createForClass(Product);
