import { IUser } from 'src/common/interfaces';
import {
  ConfirmEmailDto,
  LoginBodyDto,
  ResendEmailDto,
  SignupBodyDto,
} from './dto/signup.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { OtpRepository, UserDocument, UserRepository } from 'src/DB';
import { emailEvent } from 'src/common/utils/email/email.event';
import { OtpEnum } from 'src/common/enums/otp.enum';
import { Types } from 'mongoose';
import { createNumericalOtp, LoginCredentialsResponse, ProviderEnum, SecurityService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/services/token.service';

export class AuthenticationService {
  private users: IUser[] = [];
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly securityService: SecurityService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}
  private async createConfirmOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          code: createNumericalOtp(),
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.ConfirmEmail,
        },
      ],
    });
    emailEvent.emit('confirmEmail', { to: email, otp: otp.code });
  }
  async signup(data: SignupBodyDto): Promise<string> {
    const { email, password, username } = data;
    const checkUserExist = await this.userRepository.findOne({
      filter: { email },
    });
    if (checkUserExist) {
      throw new ConflictException('User already exists');
    }
    const [user] = await this.userRepository.create({
      data: [{ email, password, username }],
    });
    if (!user) {
      throw new BadRequestException('Failed to create user');
    }
    await this.createConfirmOtp(user._id);
    return 'Done';
  }
  async resendConfirmEmail(data: ResendEmailDto): Promise<string> {
    const { email } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: false } },
      options: {
        populate: [
          {
            path: 'otp',
            match: { type: OtpEnum.ConfirmEmail },
          },
        ],
      },
    });
    if (!user) {
      throw new NotFoundException(
        'Failed to find unconfirmed user with this email',
      );
    }
    if (user.otp?.length) {
      throw new ConflictException(
        'Confirmation email already sent. Please check your inbox.',
      );
    }
    await this.createConfirmOtp(user._id);
    return 'Done';
  }
  async confirmEmail(data: ConfirmEmailDto): Promise<string> {
    const { email, code } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: false } },
      options: {
        populate: [
          {
            path: 'otp',
            match: { type: OtpEnum.ConfirmEmail },
          },
        ],
      },
    });
    if (!user) {
      throw new NotFoundException(
        'Failed to find unconfirmed user with this email',
      );
    }
    if (
      !(user.otp?.length &&
      await this.securityService.compareHash(code, user.otp[0].code))
    ) {
      throw new BadRequestException('Invalid OTP code');
    }
    await user.confirmedAt = new Date();
    await user.save();
    await this.otpRepository.deleteOne({
      filter: { _id: user.otp[0]._id },
    });
    return 'Done';
  }
    async login(data: LoginBodyDto): Promise<LoginCredentialsResponse> {
    const { email, password } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: true }, provider:ProviderEnum.SYSTEM },
    });
    if (!user) {
      throw new NotFoundException('User not found or not confirmed');
    }
   if (!(await this.securityService.compareHash(password, user.password))) {
      throw new NotFoundException('Failed to find user with provided credentials');
    }
    return  await this.tokenService.loginCredentials(user as UserDocument);
  }
}
