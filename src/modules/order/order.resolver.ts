import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "./order.service";
import { GetAllOrdersResponse } from "./entities/order.entity";
import { GetAllGraphDto } from "src/common";
import { UsePipes, ValidationPipe } from "@nestjs/common";

@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Resolver()
export class OrderResolver {

    constructor(private readonly orderService:OrderService){}

    @Query(() => GetAllOrdersResponse , {name:"allOrders", description:"retrieve all orders"})
    async allOrders(@Args("data" , {nullable:true}) data?:GetAllGraphDto) {
        const result = await this.orderService.findAll(data , false)
        return result
    }

    @Query(() => String , {deprecationReason:"first welcome point"})
    sayHi():string {
        return "Hello graphql with nestjs"
    }

    @Mutation(() => String , {deprecationReason:"first welcome point"})
    updateOrder():string {
        return "Order"
    }
}