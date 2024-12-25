import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { DecrementItemDto } from './dto/decrement-item.dto';

@ApiTags('carts')
@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  async create(@Request() req, @Body() createCartDto: CreateCartDto) {
    const userId = req.user.id;
    return this.cartsService.create(userId, createCartDto);
  }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
  //   return this.cartsService.update(id, updateCartDto);
  // }

  @Delete()
  async decrementItem(@Body() decrementItemDto: DecrementItemDto) {
    return this.cartsService.decrementItem(decrementItemDto);
  }

  @Delete('remove')
  async remove(@Body() decrementItemDto: DecrementItemDto) {
    return this.cartsService.removeOne(decrementItemDto);
  }

  @Delete(':id/items')
  async removeAll(@Param('id') id: string) {
    return this.cartsService.removeAll(id);
  }
}
