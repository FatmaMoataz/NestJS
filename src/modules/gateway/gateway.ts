import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Types } from "mongoose";
import {Server , Socket} from 'socket.io'
import { RoleEnum, TokenEnum, TokenService } from "src/common";
import { Auth, User } from "src/common/decorators";
import type{ ISocketAuth } from "src/common/interfaces/socket.interface";
import { getSocketAuth } from "src/common/utils/socket";
import { connectedSockets, type UserDocument } from "src/DB";

@WebSocketGateway({
    cors: {
        origin:"*"
    },
    // namespace:"public"
})
export class RealtimeGateway implements OnGatewayInit , OnGatewayConnection{
    @WebSocketServer()
    private readonly server:Server

    constructor(private readonly tokenService:TokenService) {}

afterInit(server:Server) {
    console.log(`Realtime gateway starred`);
}

async handleConnection(client: ISocketAuth) {
  try {
    console.log(client);
    const authorization = getSocketAuth(client)
    const {user , decoded} = await this.tokenService.decodeToken({authorization , tokenType: TokenEnum.access})
    const userTapes = connectedSockets.get(user._id.toString()) || []
    userTapes.push(client.id)
    connectedSockets.set(user._id.toString() , userTapes)
    client.credentials = {user , decoded }
    
  } catch (error) {
    client.emit("exception" , error.message || "something went wrong")
  }
    
}

handleDisconnect(client:ISocketAuth) {
const userId = client.credentials?.user._id?.toString() as string
let remainingTabs = connectedSockets.get(userId)?.filter((tab:string) => {
    return tab !== client.id
}) || []
if(remainingTabs.length) {
    connectedSockets.set(userId , remainingTabs)
} else {
    connectedSockets.delete(userId)
    this.server.emit("offline_user" , userId)
}
}

@Auth([RoleEnum.admin , RoleEnum.user])
    @SubscribeMessage("sayHi")
    sayHi(@MessageBody() data:any , @ConnectedSocket() client:Socket , @User() user:UserDocument):string {
        this.server.emit("sayHi" , "NEST TO FE")
return "Received data"
    }

    changeProductStock(products: {productId:Types.ObjectId , stock:number}[]) {
this.server.emit("changeProductStock" , products)
    }
}