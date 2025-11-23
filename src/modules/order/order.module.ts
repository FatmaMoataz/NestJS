import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductRepository } from 'src/DB/repository/product.repository';
import { CartModel, CartRepository, CouponModel, OrderModel, OrderRepository, ProductModel } from 'src/DB';

@Module({
  imports:[OrderModel , CartModel , ProductModel , CouponModel],
  controllers: [OrderController],
  providers: [OrderService , ProductRepository , OrderRepository , CartRepository],
})
export class OrderModule {}
