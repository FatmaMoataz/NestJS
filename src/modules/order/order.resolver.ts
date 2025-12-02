import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "./order.service";
import { GetAllOrdersResponse } from "./entities/order.entity";
import { GetAllGraphDto, RoleEnum } from "src/common";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { Auth, User } from "src/common/decorators";
import type{ UserDocument } from "src/DB";

@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Resolver()
export class OrderResolver {

    constructor(private readonly orderService:OrderService){}

    @Auth([RoleEnum.admin])
    @Query(() => GetAllOrdersResponse , {name:"allOrders", description:"retrieve all orders"})
    async allOrders(
        @User() user:UserDocument,
        @Args("data" , {nullable:true}) data?:GetAllGraphDto) {
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