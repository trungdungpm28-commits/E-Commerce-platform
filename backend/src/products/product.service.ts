import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { ProductStatus } from '../generated/prisma'; // 1. Import Enum từ Prisma Client

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Seller: Thêm sản phẩm cùng các biến thể SKU
  async createProduct(userId: number, dto: CreateProductDto) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });

    if (!shop || (shop.status as string)!== 'APPROVED') {
      throw new ForbiddenException('Cửa hàng của bạn phải được kích hoạt mới có thể đăng sản phẩm');
    }

    const slugExists = await this.prisma.product.findFirst({
      where: { slug: dto.slug },
    });

    if (slugExists) {
      throw new BadRequestException('Slug sản phẩm này đã tồn tại');
    }

    const { variants, price , salePrice , ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        shopId: shop.id,
        status: ProductStatus.PENDING_APPROVAL,
        variants: {
          create: variants.map((v: any) => ({
            skuCode: v.skuCode || v.sku, // Ánh xạ v.sku sang skuCode bắt buộc trong schema
            variantName: v.variantName || v.name || null,
            price: BigInt(v.price),
            ...(v.salePrice ? { salePrice: BigInt(v.salePrice) } : {}),
            stockQuantity: v.stockQuantity ?? 0,
            weightGram: v.weightGram ?? 0,
            color: v.color || null,
            size: v.size || null,
            shopId: shop.id,
          })) as any,
        },
      } as any,
      include: { variants: true },
    });
  }

  // Buyer: Tìm kiếm, lọc theo giá, danh mục và sắp xếp
  async getPublicProducts(filter: FilterProductDto) {
    const { search, categoryId, minPrice, maxPrice, sortBy } = filter;

    const whereCondition: any = {
      status: ProductStatus.ACTIVE, // Chỉ lấy sản phẩm đã được Admin duyệt
    };

    if (search) {
      whereCondition.name = { contains: search, mode: 'insensitive' };
    }

    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereCondition.price = {};
      if (minPrice !== undefined) whereCondition.price.gte = BigInt(minPrice);
      if (maxPrice !== undefined) whereCondition.price.lte = BigInt(maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };

    return this.prisma.product.findMany({
      where: whereCondition,
      orderBy,
      include: {
        shop: { select: { id: true, name: true, logo: true } },
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        variants: true,
      },
    });
  }

  // Buyer: Xem chi tiết sản phẩm
  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
        category: true,
        brand: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }

  // Admin: Duyệt sản phẩm (PENDING_APPROVAL -> ACTIVE)
  async updateProductStatus(productId: number, dto: UpdateProductStatusDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: dto.status },
    });
  }

  // Seller: Xóa sản phẩm của mình
  async deleteProduct(userId: number, productId: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId: userId },
    });

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.shopId !== shop?.id) {
      throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}