import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { DecrementItemDto } from './dto/decrement-item.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@ApiTags('carts')
@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.cartsService.findAll(paginationQueryDto);
  }

  @Post()
  async create(@Request() req, @Body() createCartDto: CreateCartDto) {
    const userId = req.user.id;
    return this.cartsService.create(userId, createCartDto);
  }

  @Post('checkout/:cartId')
  async checkout(
    @Param('cartId') cartId: string,
    @Query('userId') userId: string,
  ) {
    return this.cartsService.checkout(cartId, userId);
  }

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
