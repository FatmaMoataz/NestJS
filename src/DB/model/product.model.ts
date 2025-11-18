import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { IBrand, ICategory, IProduct, IUser } from 'src/common';

@Schema({ timestamps: true, strictQuery: true })
export class Product implements IProduct {
  @Prop({ type: [String], required: true })
  images: string[];
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 2000,
  })
  name: string;
  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ type: String, minlength: 2, maxlength: 50000 })
  description: string;
   @Prop({ type: Types.ObjectId, required: true, ref: 'Brand' })
  brand: Types.ObjectId | IBrand;
   @Prop({ type: Types.ObjectId, required: true, ref: 'Category' })
  category: Types.ObjectId | ICategory;
  @Prop({ type: String, required: true })
  assetFolderId: string;
  @Prop({ type: Number, default: 0 })
  discountPercent: number;
  @Prop({ type: Number,required: true })
  originalPrice: number;
  @Prop({ type: Number,required: true })
  salePrice: number;
  @Prop({ type: Number,required: true })
  stock: number;
  @Prop({ type: Number,required: true })
  soldItems: number;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  createdBy: Types.ObjectId | IUser;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId | IUser;
  @Prop({ type: Date })
  restoredAt?: Date;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ProductSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    // use name to generate slug
    this.slug = slugify(this.name);
  }
  next();
});

ProductSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<Product>;
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

ProductSchema.pre(['findOne', 'find'], async function (next) {

  const q = this.getQuery();
  if (q.paranoId === false) {
    this.setQuery({ ...q });
  } else {
    this.setQuery({ ...q, freezedAt: { $exists: false } });
  }
  next();
});

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
