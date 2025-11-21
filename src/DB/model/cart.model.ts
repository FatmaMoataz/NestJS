import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ICart, ICartProduct, IUser } from 'src/common';

@Schema({ timestamps: true, strictQuery: true })
export class CartProduct implements ICartProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
  @Prop({ type: Number, required: true })
  quantity: number;
}

@Schema({ timestamps: true, strictQuery: true })
export class Cart implements ICart {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User', unique: true })
  createdBy: Types.ObjectId | IUser;
  products: ICartProduct[];
}

export type CartProductDocument = HydratedDocument<CartProduct>;
export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: CartSchema },
]);
