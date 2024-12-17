import { Schema } from '@nestjs/mongoose';

export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: [string];
  brand: string;
  status: [string];
}
