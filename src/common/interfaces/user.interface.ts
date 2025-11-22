import { Types } from 'mongoose';
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from '../enums';
import { OTPDocument } from 'src/DB';
import { IProduct } from './product.interface';

export interface IUser {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password?: string;
  confirmedAt?: Date;
  provider: ProviderEnum;
  role: RoleEnum;
  gender: GenderEnum;
  changeCredentialsTime?: Date;
  otp?: OTPDocument[];
  preferredLanguage: LanguageEnum;
  profilePicture: string;
  createdAt?: Date;
  updatedAt?: Date;

  wishlists?: Types.ObjectId[] | IProduct[];
}
