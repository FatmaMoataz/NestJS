import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { IBrand, IUser } from 'src/common';

@Schema({ timestamps: true })
export class Brand implements IBrand {
  @Prop({ type: String, required: true })
  image: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 25,
  })
  name: string;
  @Prop({type: String, minlength: 2, maxlength: 50})
  slug: string;
  @Prop({ type: String, required: true, minlength: 2, maxlength: 25 })
  slogan: string;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  createdBy: Types.ObjectId | IUser;
}

export type BrandDocument = HydratedDocument<Brand>;
export const brandSchema = SchemaFactory.createForClass(Brand);
brandSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

brandSchema.pre(
  'save',
  async function (
    next,
  ) {
    if (this.isModified('name')) {
 this.slug = slugify(this.slug)
    }
    next();
  },
);

export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: brandSchema },
]);
