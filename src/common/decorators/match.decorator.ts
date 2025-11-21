import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'checkMongoIds', async: false })
export class CheckMongoIds implements ValidatorConstraintInterface {
  validate(value: any, _args?: ValidationArguments): boolean {
    if (!Array.isArray(value)) return false;
    return value.every((v) => Types.ObjectId.isValid(String(v)));
  }

  defaultMessage(_args?: ValidationArguments): string {
    return 'Each value must be a valid Mongo ObjectId';
  }
}

// export a symbol named `checkMongoIds` so your DTO can use `@Validate(checkMongoIds)`
export const checkMongoIds = CheckMongoIds;