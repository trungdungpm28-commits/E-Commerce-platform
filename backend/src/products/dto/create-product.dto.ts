import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { CreateVariantDto } from './create-variant.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @IsInt()
  categoryId: number;

  @IsInt()
  @IsOptional()
  brandId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}