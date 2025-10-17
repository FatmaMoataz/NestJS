import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { generateHash } from 'src/common';
import { OtpEnum } from 'src/common/enums/otp.enum';
import { emailEvent } from 'src/common/utils/email/email.event';

@Schema({ timestamps: true })
export class OTP {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  createdBy: Types.ObjectId;
  @Prop({ type: String, enum: OtpEnum, required: true })
  type: OtpEnum;
}

export type OTPDocument = HydratedDocument<OTP>;
export const OTPSchema = SchemaFactory.createForClass(OTP);
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OTPSchema.pre(
  'save',
  async function (
    this: OTPDocument & { wasNew: boolean; plainOtp?: string },
    next,
  ) {
    this.wasNew = this.isNew;
    if (this.isModified('code')) {
      this.plainOtp = this.code;
      this.code = await generateHash(this.code);
      await this.populate([{ path: 'createdBy', select: 'email' }]);
    }
    next();
  },
);

OTPSchema.post('save', async function (doc, next) {
  const that = this as OTPDocument & { wasNew: boolean; plainOtp?: string };
  console.log({
    email: (that.createdBy as any).email,
    wasNew: that.wasNew,
    plainOtp: that.plainOtp,
  });
  if (that.wasNew && that.plainOtp) {
    emailEvent.emit(doc.type, {
      to: (that.createdBy as any).email,
      otp: that.plainOtp,
    });
  }
  next();
});

export const OTPModel = MongooseModule.forFeature([
  { name: OTP.name, schema: OTPSchema },
]);
