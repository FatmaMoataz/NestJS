import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartModel, CartRepository, CouponModel, CouponRepository, OrderModel, OrderRepository, ProductModel } from 'src/DB';
import { CartService } from '../cart/cart.service';
import { PaymentService } from 'src/common';
import { RealtimeGateway } from '../gateway/gateway';

@Module({
  imports:[OrderModel , CartModel , ProductModel , CouponModel],
  controllers: [OrderController],
  providers: [RealtimeGateway,OrderService , ProductRepository , OrderRepository , CartRepository , CartService , CouponRepository, PaymentService],
})
export class OrderModule {}
