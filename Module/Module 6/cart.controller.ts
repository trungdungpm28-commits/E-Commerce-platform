import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@UseGuards(JwtGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  // Lấy danh sách giỏ hàng đã được tự động phân nhóm theo Shop
  @Get()
  getCart(@GetUser('id') userId: number) {
    return this.cartService.getCartGroupedByShop(userId);
  }

  // Thêm sản phẩm vào giỏ
  @Post('items')
  addToCart(@GetUser('id') userId: number, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  @Patch('items/:id')
  updateCartItem(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, itemId, dto);
  }

  // Xóa sản phẩm khỏi giỏ
  @Delete('items/:id')
  removeCartItem(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeCartItem(userId, itemId);
  }
}