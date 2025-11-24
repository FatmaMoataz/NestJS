import { Types } from 'mongoose';
import { IUser } from './user.interface';
import { OrderStatusEnum, PaymentEnum } from '../enums';
import { ICoupon } from './coupon.interface';
import { IProduct } from './product.interface';

export interface IOrderProduct {
  _id?: Types.ObjectId;
  productId: Types.ObjectId | IProduct;
  quantity: number;
  unitPrice:number;
  finalPrice:number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  _id?: Types.ObjectId;
  orderId:string;
  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  address:string;
  phone:string;
note?:string;
cancelReason?:string;
status:OrderStatusEnum;
payment:PaymentEnum;
coupon?:Types.ObjectId | ICoupon;
discount?:number;
total:number;
subtotal:number;
products:IOrderProduct[];
paidAt?:Date;
paymentIntent?:string;
  createdAt?: Date;
  updatedAt?: Date;
  restoredAt?: Date;
  freezedAt?: Date;
}