import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

import {
  Allow,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';
import { ContainField } from 'src/common/decorators';

@ContainField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @Allow()
  extra: any;
}

export class CategoryParamsDto {
  @IsMongoId()
  categoryId: Types.ObjectId;
}
