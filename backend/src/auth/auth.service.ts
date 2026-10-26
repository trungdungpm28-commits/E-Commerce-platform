import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { SignupDto, SigninDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { Prisma , UserRole } from '../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<{ access_token: string}> {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          fullname: `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
          phone: dto.phone || '',
          role: dto.role || UserRole.BUYER,
        },
      });

      // 3. Trả về Access Token
      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email này đã được sử dụng');
        }
      }
      throw error;
    }
  }

  async signin(dto: SigninDto) {
    // 1. Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('Email hoặc mật khẩu không chính xác');
    }

    // 2. Kiểm tra mật khẩu
    const pwMatches = await argon.verify(user.passwordHash, dto.password);
    if (!pwMatches) {
      throw new ForbiddenException('Email hoặc mật khẩu không chính xác');
    }

    // 3. Trả về Access Token
    return this.signToken(user.id, user.email, user.role);
  }

  async signToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const secret = this.config.get<string>('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}