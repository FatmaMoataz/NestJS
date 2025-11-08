import { Global, Module } from '@nestjs/common';
import { TokenModel, UserModel } from 'src/DB/model';
import { TokenRepository, UserRepository } from 'src/DB';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';

@Global()
@Module({
  imports: [UserModel, TokenModel],
  providers: [
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  controllers: [],
  exports:[ 
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
  TokenModel,
UserModel ]
})
export class SharedAuthModule {}
