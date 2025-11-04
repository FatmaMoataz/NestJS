import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { setDefaultLang, TokenEnum } from 'src/common';
import { TokenService } from 'src/common/services/token.service';
import { TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DB';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationMiddleware, PreAuth } from 'src/common/middleware/authentication.middleware';

@Module({
  imports: [UserModel, TokenModel],
  controllers: [UserController],
  providers: [
    UserService,
    TokenService,
    UserRepository,
    JwtService,
    TokenRepository,
  ],
  exports: [],
})
export class UserModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply( PreAuth(TokenEnum.access) ,AuthenticationMiddleware)
  //     .forRoutes(UserController);
  // }
}
