import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let user:any ;
       switch (ctx.getType()) {
      case 'http':
        user = ctx.switchToHttp().getRequest().credentials.user;
        break;
      // case 'rpc':
      //   const rpcCtx = context.switchToRpc();
      //   break;
      case 'ws':
        user = ctx.switchToWs().getClient().credentials.user;
        break;

      default:
        break;
    }
    return user;
  },
);

export const Decoded = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
            let user:any ;
       switch (ctx.getType()) {
      case 'http':
        user = ctx.switchToHttp().getRequest().credentials.decoded;
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
    return user;
    }
)
