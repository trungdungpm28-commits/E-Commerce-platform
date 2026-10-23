import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  // Public: Tìm kiếm và lọc danh sách sản phẩm
  @Get()
  getPublicProducts(@Query() filter: FilterProductDto) {
    return this.productService.getPublicProducts(filter);
  }

  // Public: Xem chi tiết 1 sản phẩm
  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  // Seller: Đăng bán sản phẩm mới
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SELLER)
  @Post()
  createProduct(@GetUser('id') userId: number, @Body() dto: CreateProductDto) {
    return this.productService.createProduct(userId, dto);
  }

  // Admin: Kiểm duyệt trạng thái sản phẩm
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateProductStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productService.updateProductStatus(id, dto);
  }

  // Seller: Xóa sản phẩm
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SELLER)
  @Delete(':id')
  deleteProduct(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productService.deleteProduct(userId, id);
  }
}