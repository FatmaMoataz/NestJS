import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';

import { Allow, IsMongoId } from "class-validator";
import { Types } from "mongoose";
import { ContainField } from 'src/common/decorators';

@ContainField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) {
    @Allow()
    extra:any
}

export class BrandParamsDto {
    @IsMongoId()
   brandId: Types.ObjectId;
}  