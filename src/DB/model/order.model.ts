import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IOrder, IOrderProduct, IProduct, IUser, OrderStatusEnum, PaymentEnum } from 'src/common';

@Schema({ timestamps: true, strictQuery: true , toJSON: {virtuals:true} , toObject:{virtuals:true}})
export class OrderProduct implements IOrderProduct {
    @Prop({type:Types.ObjectId , ref:'Product' , required:true})
    productId: Types.ObjectId | IProduct;
    @Prop({type:Number , required:true})
    quantity: number;
    @Prop({type:Number , required:true})
    unitPrice: number;
}

@Schema({ timestamps: true, strictQuery: true , toJSON: {virtuals:true} , toObject:{virtuals:true}})
export class Order implements IOrder {
     @Prop({ type: String, required: true })
    address: string;
    @Prop({ type: String, required: false })
    cancelReason?: string | undefined;
     @Prop({ type: Types.ObjectId, ref: 'Coupon' })
    coupon: Types.ObjectId;
     @Prop({ type: Number, default: 0 })
    discount: number;
    @Prop({ type: String, required: false })
    note?: string | undefined;
    @Prop({ type: String, required: true, unique:true })
    orderId: string;
    @Prop({ type: Date })
    paidAt?: Date;
    @Prop({type:String , enum:PaymentEnum , default:PaymentEnum.Cash})
    payment: PaymentEnum;
    @Prop({ type: String, required: false})
    paymentIntent?: string;
    @Prop({ type: String, required: true })
    phone: string;
    @Prop([OrderProduct])
    products: IOrderProduct[];
    @Prop({type:String , enum:OrderStatusEnum , default: function(this:Order) {
return this.payment == PaymentEnum.Card ? OrderStatusEnum.Pending : OrderStatusEnum.Placed
    }})
    status: OrderStatusEnum;
     @Prop({ type: Number})
    subtotal: number;
    @Prop({ type: Number , default:true})
    total: number;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  createdBy: Types.ObjectId | IUser;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId | IUser;
  @Prop({ type: Date })
  restoredAt?: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OrderSchema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
  const q = this.getQuery();
  if (q.paranoId === false) {
    this.setQuery({ ...q });
  } else {
    this.setQuery({ ...q, freezedAt: { $exists: false } });
  }
  next();
});

OrderSchema.pre(['findOne', 'find'], async function (next) {

  const q = this.getQuery();
  if (q.paranoId === false) {
    this.setQuery({ ...q });
  } else {
    this.setQuery({ ...q, freezedAt: { $exists: false } });
  }
  next();
});

export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
