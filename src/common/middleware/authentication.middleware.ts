import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { TokenService } from '../services/token.service';
import { TokenEnum } from '../enums';
import { IAuthRequest } from '../interfaces/token.interface';


export const PreAuth = (tokenType: TokenEnum = TokenEnum.access) => {
return async(req: IAuthRequest, res: Response, next: NextFunction) => {
    req.tokenType = tokenType
    next()
}
} 


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  async use(req: IAuthRequest, res: Response, next: NextFunction) {
    const { user, decoded } = await this.tokenService.decodeToken({
      authorization: req.headers.authorization ?? '',
      tokenType: req.tokenType as TokenEnum,
    });
    req.credentials = { user, decoded };
    next();
  }
}
