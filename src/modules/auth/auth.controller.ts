import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import {
  ConfirmEmailDto,
  LoginBodyDto,
  ResendEmailDto,
  SignupBodyDto,
} from './dto/signup.dto';
import { LoginResponse } from './entities/auth.entity';
import { IResponse, successResponse } from 'src/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthenticationService) {}

  @Post('signup')
  async signup(
    @Body()
    body: SignupBodyDto,
  ): Promise<IResponse> {
    await this.authService.signup(body);
    return successResponse();
  }

  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body()
    body: ResendEmailDto,
  ): Promise<IResponse>{
    await this.authService.resendConfirmEmail(body);
    return successResponse();
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailDto,
  ): Promise<IResponse> {
    await this.authService.confirmEmail(body);
    return successResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body()
    body: LoginBodyDto,
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authService.login(body);
    return successResponse<LoginResponse>({
      message:'Done',
      data:{credentials}
    });
  }
}
