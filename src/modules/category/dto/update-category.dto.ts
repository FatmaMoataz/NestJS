import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

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
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Allow()
  extra: any;
}

export class CategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;
}

export class GetAllCategoryDto {
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
