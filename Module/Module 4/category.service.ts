import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // === DANH MỤC (CATEGORY) ===

  // Admin tạo danh mục (có thể chỉ định danh mục cha parentId)
  async createCategory(dto: CreateCategoryDto) {
    const slugExists = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (slugExists) {
      throw new BadRequestException('Slug danh mục này đã tồn tại');
    }

    if (dto.parentId) {
      const parentExists = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parentExists) {
        throw new NotFoundException('Danh mục cha không tồn tại');
      }
    }

    return this.prisma.category.create({
      data: { ...dto },
    });
  }

  // Lấy cây danh mục đa cấp (Danh mục gốc cấp 1 kèm các con cấp bên trong)
  async getCategoryTree() {
    return this.prisma.category.findMany({
      where: { parentId: null }, // Lấy danh mục cha cao nhất
      include: {
        children: {
          include: {
            children: true, // Hỗ trợ cây danh mục đa cấp
          },
        },
      },
    });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    return this.prisma.category.delete({ where: { id } });
  }

  // === THƯƠNG HIỆU (BRAND) ===

  // Admin tạo thương hiệu chính hãng
  async createBrand(dto: CreateBrandDto) {
    const brandExists = await this.prisma.brand.findUnique({
      where: { name: dto.name },
    });

    if (brandExists) {
      throw new BadRequestException('Thương hiệu này đã tồn tại');
    }

    return this.prisma.brand.create({
      data: { ...dto },
    });
  }

  // Public: Lấy danh sách tất cả thương hiệu
  async getAllBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async deleteBrand(id: number) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');

    return this.prisma.brand.delete({ where: { id } });
  }
}