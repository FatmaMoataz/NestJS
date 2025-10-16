import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModel } from 'src/DB/model';
import { UserRepository } from 'src/DB';
import { SecurityService } from 'src/common';

@Module({
  imports: [UserModel],
  providers: [AuthenticationService, UserRepository, SecurityService],
  controllers: [AuthController],
})
export class AuthModule {}
