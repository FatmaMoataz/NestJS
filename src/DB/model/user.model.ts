import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, generateHash, IUser, LanguageEnum, ProviderEnum, RoleEnum } from 'src/common';
import { OTPDocument } from './otp.model';

@Schema({
  strictQuery: true,
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User implements IUser{
  @Prop({
    required: true,
    type: String,
    minlength: 2,
    maxlength: 30,
    trim: true,
  })
  firstName: string;

  @Prop({
    required: true,
    type: String,
    minlength: 2,
    maxlength: 30,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (v: string) {
      const [firstName, lastName] = v.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  username: string;

  @Prop({
    required: true,
    type: String,
    unique: true,
  })
  email: string;

  @Prop({
    required: false,
    type: Date,
  })
  confirmEmail: Date;

  @Prop({
    required: function (this: User) {
      return this.provider === ProviderEnum.GOOGLE ? false : true;
    },
    type: String,
  })
  password: string;

  @Prop({ type: String, default: ProviderEnum.SYSTEM, enum: ProviderEnum })
  provider: ProviderEnum;

  @Prop({ type: String, default: RoleEnum.user, enum: RoleEnum })
  role: RoleEnum;

  @Prop({ type: String, default: GenderEnum.male, enum: GenderEnum })
  gender: GenderEnum;

  @Prop({ type: String, default: LanguageEnum.EN, enum: LanguageEnum })
  preferredLanguage: LanguageEnum;

  @Prop({ type: String })
  profilePicture: string;

  @Prop({
    required: false,
    type: Date,
  })
  changeCredentialsTime: Date;

  @Virtual()
  otp: OTPDocument[];
}

const userSchema = SchemaFactory.createForClass(User);
userSchema.virtual('otp', {
  ref: 'OTP',
  localField: '_id',
  foreignField: 'createdBy',
});
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await generateHash(this.password);
  }
  next();
});
export type UserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);

export { userSchema };
