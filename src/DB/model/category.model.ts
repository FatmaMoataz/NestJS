import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { ICategory, IUser } from 'src/common';

@Schema({ timestamps: true, strictQuery: true })
export class Category implements ICategory {
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
  @Prop({ type: String, minlength: 2, maxlength: 5000 })
  description: string;
    @Prop({ type: String, required: true })
  assetFolderId: string;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  createdBy: Types.ObjectId | IUser;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId | IUser;
  @Prop({ type: Date })
  restoredAt?: Date;
@Prop({ type: Date })
  freezedAt?: Date;
  @Prop({type:[{ type: Types.ObjectId, ref: 'Brand' }]})
  brands?: Types.ObjectId[];
}

export type CategoryDocument = HydratedDocument<Category>;
export const categorySchema = SchemaFactory.createForClass(Category);
categorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

categorySchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    // use name to generate slug
    this.slug = slugify(this.name);
  }
  next();
});

categorySchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<Category>;
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

categorySchema.pre(['findOne', 'find'], async function (next) {

  const q = this.getQuery();
  if (q.paranoId === false) {
    this.setQuery({ ...q });
  } else {
    this.setQuery({ ...q, freezedAt: { $exists: false } });
  }
  next();
});

export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: categorySchema },
]);
