import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/common/enums/order.status';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message:
      'Status must be one of the following: Pending, Shipped, Delivered, or Cancelled.',
  })
  status: OrderStatus;
}
