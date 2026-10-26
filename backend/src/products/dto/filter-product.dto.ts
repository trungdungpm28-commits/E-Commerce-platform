import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterProductDto {
  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}