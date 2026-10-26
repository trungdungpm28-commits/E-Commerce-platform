import {Body, Controller, Delete, Get, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import { UserRole as User } from '../generated/prisma';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // Lấy thông tin tài khoản đăng nhập
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  // Cập nhật thông tin cá nhân
  @Patch('me')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }//edit to update

  // Đổi mật khẩu
  @Patch('change-password')
  changePassword(
    @GetUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto);
  }

  // Tạo địa chỉ giao hàng mới
  @Post('addresses')
  createAddress(
    @GetUser('id') userId: number,
    @Body() dto: CreateAddressDto,
  ) {
    return this.userService.createAddress(userId, dto);
  }

  // Danh sách địa chỉ giao hàng
  @Get('addresses')
  getAddresses(@GetUser('id') userId: number) {
    return this.userService.getAddresses(userId);
  }

  // delete User

  @Delete('me')
  delete(@GetUser('id') userId: number) {
    return this.userService.deleteMe(userId);
  }

  @Roles(User.ADMIN)
  @Delete(':id')
  deleteUser(@GetUser('id' , ParseIntPipe) targetUserId: number) {
    return this.userService.deleteUser(targetUserId);
  }
}