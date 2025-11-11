import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { OtpEnum } from '../enums';

export interface IOtp {
  _id?: Types.ObjectId;
  code:string;
  expiresAt:Date;
  type:OtpEnum;
createdBy:Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}
