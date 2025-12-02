import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tokenName } from 'src/common/decorators';
import { TokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/services/token.service';
import { getSocketAuth } from 'src/common/utils/socket';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService , private readonly reflector:Reflector){}
  async canActivate(
    context: ExecutionContext,
  ):Promise<boolean>{

const tokenType: TokenEnum = this.reflector.getAllAndOverride<TokenEnum>(tokenName, [
  context.getHandler(),
  context.getClass()
]) ?? TokenEnum.access

    let req:any;
    let authorization: string = ""
    switch (context.getType<string>()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization
        break;
      case 'graphql':
        req = GqlExecutionContext.create(context).getContext().req
        authorization = req.headers.authorization
        break;
      case 'ws':
        const wsCtx = context.switchToWs();
        req = wsCtx.getClient()
        authorization = getSocketAuth(req)
        break;

      default:
        break;
    }
    if(!authorization) {
      return false
    }
    const { decoded, user } = await this.tokenService.decodeToken({
      authorization,
      tokenType: TokenEnum.access
    })
    req.credentials = {decoded, user}
    return true;
  }
}
