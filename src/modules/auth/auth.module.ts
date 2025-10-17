import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTPModel, UserModel } from 'src/DB/model';
import { OtpRepository, UserRepository } from 'src/DB';
import { SecurityService } from 'src/common';

@Module({
  imports: [UserModel, OTPModel],
  providers: [
    AuthenticationService,
    UserRepository,
    SecurityService,
    OtpRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
