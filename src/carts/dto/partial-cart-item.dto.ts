import { PartialType } from '@nestjs/swagger';
import { CartItemDto } from './cart-item.dto';

export class PartialCartItemDto extends PartialType(CartItemDto) {}
