import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty()
  variantId: number;

  @IsInt()
  @Min(1, { message: 'Số lượng mua tối thiểu là 1' })
  quantity: number;
}