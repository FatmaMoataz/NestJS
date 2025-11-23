import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { CouponEnum, ICoupon } from 'src/common';

@Schema({ timestamps: true, strictQuery: true })
export class Coupon implements ICoupon {
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
  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
  @Prop({type:[{ type: Types.ObjectId, ref: 'User' }]})
  usedBy: Types.ObjectId[];
  @Prop({ type: Date })
  restoredAt?: Date;
    @Prop({ type: Date })
  freezedAt: Date;
      @Prop({ type: Date , required: true})
  startDate: Date;
        @Prop({ type: Date , required: true })
  endDate: Date;
  @Prop({ type: Number , required: true })
  duration: number;
  @Prop({ type: Number , default: 1 })
  discount:number;
  @Prop({ type: String , enum:CouponEnum , default:CouponEnum.Percent })
  type:CouponEnum;
}

export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

CouponSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    // use name to generate slug
    this.slug = slugify(this.name);
  }
  next();
});

CouponSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<Coupon>;
  if (update.name) {
    this.setUpdate({
      ...update,
      slug: slugify(update.name),
    });
  }

  const q = this.getQuery();
  if (q.paranoId === false) {
    this.setQuery({ ...q });
  } else {
    this.setQuery({ ...q, freezedAt: { $exists: false } });
  }
  next();
});

CouponSchema.pre(['findOne', 'find'], async function (next) {

  const q = this.getQuery();
  if (q.paranoId === false) {
    this.setQuery({ ...q });
  } else {
    this.setQuery({ ...q, freezedAt: { $exists: false } });
  }
  next();
});

export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: CouponSchema },
]);
