import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UserRole as Role } from '../generated/prisma';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  // --- API Danh mục (Public & Admin) ---

  // Công khai: Xem cây danh mục đa cấp
  @Get()
  getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  // Admin: Tạo danh mục mới
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  // Admin: Xóa danh mục
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }

  // --- API Thương hiệu (Public & Admin) ---

  // Công khai: Xem danh sách thương hiệu
  @Get('brands/all')
  getAllBrands() {
    return this.categoryService.getAllBrands();
  }

  // Admin: Tạo thương hiệu chính hãng
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('brands')
  createBrand(@Body() dto: CreateBrandDto) {
    return this.categoryService.createBrand(dto);
  }

  // Admin: Xóa thương hiệu
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('brands/:id')
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteBrand(id);
  }
}