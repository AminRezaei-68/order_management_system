import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ProductCategory } from 'src/common/enums/category.enum';
import { ProductStatus } from 'src/common/enums/status.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ProductCategory, {
    each: true,
    message:
      'Category must be either "clothing" or "electronics" or "home_appliances" or "jewelry".',
  })
  category: ProductCategory[];

  @IsString()
  @IsOptional()
  brand?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ProductStatus, {
    each: true,
    message:
      'status must be either "clothing" or "electronics" or "home_appliances" or "jewelry".',
  })
  status: ProductStatus[];
}
