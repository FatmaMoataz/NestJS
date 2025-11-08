import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTPModel } from 'src/DB/model';
import { OtpRepository} from 'src/DB';
import { SecurityService } from 'src/common';

@Module({
  imports: [OTPModel],
  providers: [
    AuthenticationService,
    SecurityService,
    OtpRepository,
  ],
  controllers: [AuthController],
  exports:[]
})
export class AuthModule {}
