import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let req:any ;
       switch (ctx.getType()) {
      case 'http':
        req = ctx.switchToHttp().getRequest();
        break;
      // case 'rpc':
      //   const rpcCtx = context.switchToRpc();
      //   break;
      // case 'ws':
      //   const wsCtx = context.switchToWs();
      //   break;

      default:
        break;
    }
    return req.credentials.user;
  },
);
