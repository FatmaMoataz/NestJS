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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthenticationService) {}

  @Post('signup')
  async signup(
    @Body()
    body: SignupBodyDto,
  ): Promise<{ message: string }> {
    await this.authService.signup(body);
    return { message: 'done' };
  }

  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body()
    body: ResendEmailDto,
  ): Promise<{ message: string }> {
    await this.authService.resendConfirmEmail(body);
    return { message: 'done' };
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailDto,
  ): Promise<{ message: string }> {
    await this.authService.confirmEmail(body);
    return { message: 'done' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body()
    body: LoginBodyDto,
  ): Promise<LoginResponse> {
    const credentials = await this.authService.login(body);
    return { message: 'done', data: { credentials } };
  }
}
