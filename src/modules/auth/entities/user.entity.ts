import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import {
  GenderEnum,
  IProduct,
  IUser,
  LanguageEnum,
  ProviderEnum,
  RoleEnum,
} from 'src/common';
import { OTP } from 'src/DB';

registerEnumType(LanguageEnum, {
  name: 'LanguageEnum',
});

registerEnumType(GenderEnum, {
  name: 'GenderEnum',
});

registerEnumType(RoleEnum, {
  name: 'RoleEnum',
});

registerEnumType(ProviderEnum, {
  name: 'ProviderEnum',
});

export class ProfileResponse {
  profile: IUser;
}

@ObjectType()
export class OneUserResponse implements IUser {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => Date, { nullable: true })
  changeCredentialsTime?: Date;
  @Field(() => Date, { nullable: true })
  confirmedAt?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
  @Field(() => String)
  email: string;
  @Field(() => String)
  firstName: string;
  @Field(() => GenderEnum)
  gender: GenderEnum;
  @Field(() => String)
  lastName: string;
//   otp?: (Document<unknown, {}, OTP, {}, {}> &
//     OTP & { _id: Types.ObjectId } & { __v: number })[];
  @Field(() => String, { nullable: true })
  password?: string;
  @Field(() => LanguageEnum)
  preferredLanguage: LanguageEnum;
  @Field(() => String)
  profilePicture: string;
  @Field(() => ProviderEnum)
  provider: ProviderEnum;
  @Field(() => RoleEnum)
  role: RoleEnum;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field(() => String, { nullable: true })
  username?: string;
  @Field(() => [ID] , {nullable:true})
  wishlists?: Types.ObjectId[];
}
