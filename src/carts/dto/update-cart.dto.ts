import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PartialCartItemDto } from './partial-cart-item.dto';

export class UpdateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialCartItemDto)
  items: PartialCartItemDto[];
}
