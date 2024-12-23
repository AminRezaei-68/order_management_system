import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CartItemDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  price: number;
}
