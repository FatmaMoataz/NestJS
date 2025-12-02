import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { IOrder, IOrderProduct, IProduct, IToken, type IUser, OrderStatusEnum, PaymentEnum } from "src/common";
import { Lean } from "src/DB";
import { OneUserResponse } from "src/modules/auth/entities/user.entity";

export class OrderResponse {
    order:IOrder
}

registerEnumType(PaymentEnum , {
    name:"PaymentEnum"
}) 

registerEnumType(OrderStatusEnum , {
    name:"OrderStatusEnum"
}) 

@ObjectType()
export class OneOrderProductResponse implements IOrderProduct{
    @Field(() => ID)
_id?: Types.ObjectId;
@Field(() => ID)
productId: Types.ObjectId;
@Field(() => Number , {nullable:false})
quantity: number;
@Field(() => Number , {nullable:false})
unitPrice: number;
@Field(() => Number , {nullable:false})
finalPrice: number;
@Field(() => Date , {nullable:true})
createdAt?: Date;
@Field(() => Date , {nullable:true})
updatedAt?: Date;
}

@ObjectType({description:"one order response"})
export class OneOrderResponse implements IOrder{
    @Field(() => ID)
    _id: Types.ObjectId;
    @Field(() => String)
    orderId: string;
    @Field(() => String)
    address: string;
    @Field(() => String)
    phone: string;
    @Field(() => String , {nullable:true})
    note?: string;
    @Field(() => ID , {nullable:true})
    coupon?: Types.ObjectId;
    @Field(() => Date , {nullable:true})
    createdAt?: Date;
    @Field(() => OneUserResponse)
    createdBy: IUser;
    @Field(() => Number , {nullable:true})
    discount?: number;
    @Field(() => Date , {nullable:true})
    freezedAt?: Date;
    @Field(() => String , {nullable:true})
    paymentIntent?: string;
    @Field(() => Date , {nullable:true})
    paidAt?: Date;
    @Field(() => PaymentEnum)
    payment: PaymentEnum;
    @Field(() => [OneOrderProductResponse])
    products: IOrderProduct[];
    @Field(() => Date , {nullable:true})
    restoredAt?: Date;
    @Field(() => String)
    status: OrderStatusEnum;
    @Field(() => Number , {nullable:false})
    subtotal: number;
    @Field(() => Number , {nullable:false})
    total: number;
     @Field(() => Date , {nullable:true})
    updatedAt?: Date;
    @Field(() => ID , {nullable:true})
    updatedBy?: Types.ObjectId;
}

@ObjectType({description:"include paginated response contain all orders"})
export class GetAllOrdersResponse {

        @Field(() => Number , {nullable:true})
         docsCount?:number
          @Field(() => Number , {nullable:true})
         limit?: number
          @Field(() => Number , {nullable:true})
         pages?: number
          @Field(() => Number , {nullable:true})
         currentPage?: number
          @Field(() => [OrderResponse])
         result: IToken[] | Lean<IToken>[]
}
