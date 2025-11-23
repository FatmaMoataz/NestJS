import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartRepository, CouponRepository, OrderRepository, UserDocument } from 'src/DB';
import { ProductRepository } from 'src/DB/repository/product.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly couponRepository: CouponRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
  ) {}
  async create(createOrderDto: CreateOrderDto , user:UserDocument) {
    return 'This action adds a new order';
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
