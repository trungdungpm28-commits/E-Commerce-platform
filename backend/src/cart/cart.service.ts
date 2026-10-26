import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Lấy hoặc tạo mới Giỏ hàng cho User
  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  // Thêm sản phẩm biến thể vào giỏ (Kiểm tra tồn kho khả dụng)
  async addToCart(userId: number, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    // Kiểm tra đã có sản phẩm trong giỏ chưa
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
      },
    });

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + dto.quantity;

    // Kiểm tra tồn kho
    if (newQuantity > variant.stockQuantity) {
      throw new BadRequestException(
        `Kho chỉ còn ${variant.stockQuantity} sản phẩm, bạn đã có ${currentQuantity} trong giỏ`,
      );
    }

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });
  }

  // Xem giỏ hàng & TỰ ĐỘNG GOM NHÓM THEO CỬA HÀNG (SHOP)
  async getCartGroupedByShop(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    shop: {
                      select: { id: true, name: true, logo: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { shops: [], totalItems: 0 };
    }

    // Gom nhóm các CartItem theo Shop ID
    const groupedShops: Record<number, any> = {};

    cart.items.forEach((item) => {
      const shop = item.variant.product.shop;
      if (!groupedShops[shop.id]) {
        groupedShops[shop.id] = {
          shopId: shop.id,
          shopName: shop.name,
          shopLogo: shop.logo,
          items: [],
        };
      }

      groupedShops[shop.id].items.push({
        cartItemId: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        color: item.variant.color,
        size: item.variant.size,
        price: item.variant.salePrice || item.variant.price,
        stockQuantity: item.variant.stockQuantity,
        quantity: item.quantity,
        weightGram: item.variant.weightGram,
      });
    });

    return {
      cartId: cart.id,
      shops: Object.values(groupedShops),
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  // Cập nhật số lượng item
  async updateCartItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true, cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Mục giỏ hàng không tồn tại');
    }

    if (dto.quantity > item.variant.stockQuantity) {
      throw new BadRequestException(`Số lượng tồn kho không đủ (chỉ còn ${item.variant.stockQuantity})`);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
  }

  // Xóa item khỏi giỏ
  async removeCartItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Mục giỏ hàng không tồn tại');
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }
}