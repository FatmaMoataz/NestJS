import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Validate } from 'class-validator';
import { Types } from 'mongoose';
import { checkMongoIds } from 'src/common/decorators/match.decorator';

export class RemoveItemsFromCartDto {
@Validate(checkMongoIds)
productIds:Types.ObjectId[];
}
export class UpdateCartDto extends PartialType(CreateCartDto) {}
