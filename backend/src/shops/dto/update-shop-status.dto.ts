import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShopStatus } from '../../generated/prisma';

export class UpdateShopStatusDto {
  @IsEnum(ShopStatus, { message: 'Trạng thái cửa hàng không hợp lệ' })
  @IsNotEmpty()
  status: ShopStatus;
}