import { Type } from 'class-transformer';
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
import { ProductCategory } from '../../common/enums/category.enum';
import { ProductStatus } from '../../common/enums/status.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @Type(() => Number)
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
      'status must be either "In Stock" or "Out of Stock" or "Active" or "Inactive".',
  })
  status: ProductStatus[] = [ProductStatus.InStock];
}
