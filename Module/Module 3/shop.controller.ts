import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { EditShopDto } from './dto/edit-shop.dto';
import { UpdateShopStatusDto } from './dto/update-shop-status.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('shops')
export class ShopController {
  constructor(private shopService: ShopService) {}

  // Buyer đăng ký mở cửa hàng
  @Post()
  createShop(@GetUser('id') userId: number, @Body() dto: CreateShopDto) {
    return this.shopService.createShop(userId, dto);
  }

  // Seller xem thông tin cửa hàng của mình
  @Get('my-shop')
  getMyShop(@GetUser('id') userId: number) {
    return this.shopService.getMyShop(userId);
  }

  // Seller chỉnh sửa thông tin cửa hàng
  @Patch('my-shop')
  editMyShop(@GetUser('id') userId: number, @Body() dto: EditShopDto) {
    return this.shopService.editMyShop(userId, dto);
  }

  // Admin: Lấy danh sách tất cả các Shop
  @Roles(Role.ADMIN)
  @Get()
  getAllShops() {
    return this.shopService.getAllShops();
  }

  // Admin: Phê duyệt / Từ chối / Khóa cửa hàng
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateShopStatus(
    @Param('id', ParseIntPipe) shopId: number,
    @Body() dto: UpdateShopStatusDto,
  ) {
    return this.shopService.updateShopStatus(shopId, dto);
  }
}