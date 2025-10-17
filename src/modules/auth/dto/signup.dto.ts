import {
  IsNotEmpty,
  Length,
  IsString,
  IsEmail,
  IsStrongPassword,
  ValidatorConstraint,
  ValidationArguments,
  ValidatorConstraintInterface,
  Validate,
  MinLength,
  Matches,
} from 'class-validator';

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class MatchBetweenFields implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return value === args.object['password'];
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'confirmPassword must match password';
  }
}

export class ResendEmailDto {
  @IsEmail()
  email: string;
}

export class ConfirmEmailDto extends ResendEmailDto {
  @Matches(/^\d{6}$/, { message: 'otp must be a 6-digit number' })
  code: string;
}

export class LoginBodyDto extends ResendEmailDto {
  @IsStrongPassword({ minUppercase: 1 })
  password: string;
}

export class SignupBodyDto extends LoginBodyDto {
  @Length(2, 10, { message: 'username must be between 2 and 10 characters' })
  @IsNotEmpty()
  @IsString()
  username: string;
  // @IsEmail()
  // email: string;
  // @IsStrongPassword()
  // password: string;
  @Validate(MatchBetweenFields, {
    message: 'confirmPassword must match password',
  })
  confirmPassword: string;
}

export class SignupQueryDto {
  @MinLength(2)
  @IsString()
  flag: string;
}
