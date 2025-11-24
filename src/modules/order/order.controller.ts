import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth, User } from 'src/common/decorators';
import { endpoint } from './authorization';
import { type UserDocument } from 'src/DB';
import { IResponse, successResponse } from 'src/common';
import { OrderResponse } from './entities/order.entity';

@UsePipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted:true}))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth(endpoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ status: 201, data: { order } });
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
