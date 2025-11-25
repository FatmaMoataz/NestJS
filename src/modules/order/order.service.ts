import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartRepository, CouponRepository, OrderDocument, OrderProduct, OrderRepository, ProductDocument, UserDocument } from 'src/DB';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CouponEnum, OrderStatusEnum, PaymentEnum, PaymentService } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import Stripe from 'stripe';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderRepository: OrderRepository,
    private readonly couponRepository: CouponRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}
  async create(createOrderDto: CreateOrderDto , user:UserDocument):Promise<OrderDocument> {
    const cart = await this.cartRepository.findOne({filter:{createdBy:user._id}})
    if(!cart?.products?.length) {
throw new NotFoundException("Cart is empty")
    }
    let discount = 0
    let coupon:any
    if(createOrderDto.coupon) {
      coupon = await this.couponRepository.findOne({
        filter:{
          _id: createOrderDto.coupon,
          startDate: {$lte: new Date()},
          endDate: {$gte: new Date()},
        }
      })
      if(!coupon) {
        throw new NotFoundException("Fail to find matching coupon")
      }
      if(coupon.duration <= coupon.usedBy.filter((ele) => {return ele.toString() == user._id.toString()}).length) {
throw new ConflictException("Sorry you have reached the limit for this coupon")
      }
    }
    let total = 0;
    const products:OrderProduct[] = []
       if(coupon) {
discount = coupon.type == CouponEnum.Percent  ? coupon.discount/100 : coupon.discount/total
    }
    delete createOrderDto.coupon
    const [order] = await this.orderRepository.create({
data:[{
  ...createOrderDto,
  coupon:coupon?._id,
  discount,
  orderId: randomUUID().slice(0, 8),
  createdBy: user._id,
  products,
  total
}]
    })
    if(!order) {
throw new BadRequestException("Fail to create this order")
    }
    if(coupon) {
      coupon.usedBy.push(user._id)
      await coupon.save()
    }
    for(const product of cart.products) {
 await this.productRepository.updateOne({
  filter:{
    _id:product.productId,
    stock:{$gte: product.quantity}
  },
  update: {
    $inc:{__v:1 , stock:-product.quantity}
  }
})
    }
//  await this.cartService.remove(user)
    return order;
  }

  async checkout(orderId: Types.ObjectId, user: UserDocument) {
const order = await this.orderRepository.findOne({
  filter: {
    _id: orderId,
    createdBy: user._id,
    payment: PaymentEnum.Card,
    status: OrderStatusEnum.Pending
  },
  options: {
    populate: [{path: "products.productId" , select: "name"}]
  }
})
if(!order) {
throw new NotFoundException("Fail to find matching order")
}
let discounts:Stripe.Checkout.SessionCreateParams.Discount[]=[]
if(order.discount) {
const coupon = await this.paymentService.createCoupon({
  duration:'once',
  currency:'egp',
  percent_off: order.discount * 100
})
discounts.push({coupon: coupon.id})
}
const session = await this.paymentService.checkoutSession({
  customer_email : user.email,
  metadata : { orderId: orderId.toString() },
  discounts,
  line_items: order.products.map(product => {
    return {
      quantity: product.quantity,
      price_data: {
        currency:'egp',
        product_data: {
          name: (product.productId as ProductDocument).name
        },
        unit_amount: product.unitPrice * 100
      }
    }
  })
})
return session
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
