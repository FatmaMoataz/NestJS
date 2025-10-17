import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { LoginBodyDto, ResendEmailDto, SignupBodyDto } from './dto/signup.dto';

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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body()
    body: LoginBodyDto,
  ): {
    message: string;
  } {
    // const id: number = this.authService.signup(body);
    return { message: 'done' };
  }
}
