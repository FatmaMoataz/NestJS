import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTPModel, TokenModel, UserModel } from 'src/DB/model';
import { OtpRepository, TokenRepository, UserRepository } from 'src/DB';
import { SecurityService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';

@Module({
  imports: [UserModel, OTPModel, TokenModel],
  providers: [
    AuthenticationService,
    UserRepository,
    SecurityService,
    OtpRepository,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
