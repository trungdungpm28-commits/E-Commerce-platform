import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty({ message: 'SKU không được để trống' })
  sku: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsInt()
  @Min(0)
  weightGram: number;
}