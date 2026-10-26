import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @IsInt()
  @IsOptional()
  parentId?: number;
}