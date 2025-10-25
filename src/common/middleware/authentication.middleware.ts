import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { TokenService } from "../services/token.service";
import { TokenEnum } from "../enums";
import { IAuthRequest } from "../interfaces/token.interface";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    constructor(private readonly tokenService: TokenService) {}
    async use(req:IAuthRequest, res:Response, next:NextFunction) {
const {user, decoded} = await this.tokenService.decodeToken({
    authorization: req.headers.authorization ?? '',
    tokenType: TokenEnum.access
})
req.credentials = {user, decoded}
        next()
    }
}