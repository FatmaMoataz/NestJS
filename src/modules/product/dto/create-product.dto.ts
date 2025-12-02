import { Type } from "class-transformer";
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";
import { Types } from "mongoose";
import { IProduct } from "src/common";

// ✅ Variant DTO
class ProductVariantDto {
  @IsString()
  sku: string;

  @IsOptional()
  options?: Record<string, string>; // { color: "red", size: "XL" }

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  originalPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountPercent?: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  salePrice: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  stock: number;
}

export class CreateProductDto implements Partial<IProduct> {
  @IsMongoId()
  brand: Types.ObjectId;

  @IsMongoId()
  category: Types.ObjectId;

  @Length(2, 50000)
  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  discountPercent: number;

  @Length(2, 2000)
  @IsString()
  @IsOptional()
  name: string;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  originalPrice: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  stock: number;

//  optional variant
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
