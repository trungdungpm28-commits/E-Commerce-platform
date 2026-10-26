import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { EditShopDto } from './dto/edit-shop.dto';
import { UpdateShopStatusDto } from './dto/update-shop-status.dto';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  // Buyer đăng ký mở cửa hàng (chờ Admin duyệt)
  async createShop(userId: number, dto: CreateShopDto) {
    const existingShop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });

    if (existingShop) {
      throw new BadRequestException('Tài khoản này đã đăng ký cửa hàng');
    }

    const nameExists = await this.prisma.shop.findUnique({
      where: { name: dto.name },
    });

    if (nameExists) {
      throw new BadRequestException('Tên cửa hàng này đã tồn tại');
    }

    return this.prisma.shop.create({
      data: {
        ownerId: userId,
        ...dto,
      },
    });
  }

  // Lấy thông tin Shop của Seller hiện tại
  async getMyShop(userId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });

    if (!shop) {
      throw new NotFoundException('Bạn chưa có cửa hàng nào');
    }

    return shop;
  }

  // Seller cập nhật thông tin Shop
  async editMyShop(userId: number, dto: EditShopDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy cửa hàng');
    }

    if ((shop.status as string )=== 'LOCKED' || (shop.status as string) === 'REJECTED') {
      throw new ForbiddenException('Cửa hàng của bạn đang bị khóa hoặc chưa được duyệt');
    }

    return this.prisma.shop.update({
      where: { ownerId: userId },
      data: { ...dto },
    });
  }

  // Admin: Lấy danh sách toàn bộ Shop
  async getAllShops() {
    return this.prisma.shop.findMany({
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  // Admin: Duyệt / Khóa cửa hàng
  async updateShopStatus(shopId: number, dto: UpdateShopStatusDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Không tìm thấy cửa hàng');
    }

    // Nếu phê duyệt shop, tự động nâng cấp Role của User sở hữu lên SELLER
    if ((dto.status as string) === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: shop.ownerId },
        data: { role: 'SELLER' },
      });
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data: { status: dto.status },
    });
  }
}