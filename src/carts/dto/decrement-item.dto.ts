import { IsNotEmpty, IsString } from 'class-validator';

export class DecrementItemDto {
  @IsNotEmpty()
  @IsString()
  cartId: string;

  @IsNotEmpty()
  @IsString()
  productId: string;
}
