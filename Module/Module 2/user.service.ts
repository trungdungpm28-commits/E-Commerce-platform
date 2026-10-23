import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    delete user.hash;
    return user;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const pwMatches = await argon.verify(user.hash, dto.oldPassword);
    if (!pwMatches) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const newHash = await argon.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hash: newHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // Quản lý Sổ địa chỉ
  async createAddress(userId: number, dto: CreateAddressDto) {
    if (dto.isDefault) {
      // Bỏ mặc định các địa chỉ cũ nếu địa chỉ mới là mặc định
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getAddresses(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }
}