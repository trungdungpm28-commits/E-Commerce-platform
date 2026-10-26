import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './brands/category.module';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './products/product.module';
import { PrismaModule } from './prisma.module';
import { ShopModule } from './shops/shop.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    ShopModule,
    CartModule,
  ],
})
export class AppModule {}
