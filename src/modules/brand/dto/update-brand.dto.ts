import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';

import {
  Allow,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { ContainField } from 'src/common/decorators';
import { Type } from 'class-transformer';

@ContainField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @Allow()
  extra: any;
}

export class BrandParamsDto {
  @IsMongoId()
  brandId: Types.ObjectId;
}

export class GetAllBrandDto {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @IsOptional()
  size: number;
  
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  search: string;
}
