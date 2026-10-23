import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShopStatus } from '@prisma/client';

export class UpdateShopStatusDto {
  @IsEnum(ShopStatus, { message: 'Trạng thái cửa hàng không hợp lệ' })
  @IsNotEmpty()
  status: ShopStatus;
}