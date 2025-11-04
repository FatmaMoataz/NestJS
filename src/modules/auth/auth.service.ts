import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import {
  createNumericalOtp,
  LoginCredentialsResponse,
  ProviderEnum,
  SecurityService,
} from 'src/common';
import { OtpEnum } from 'src/common/enums/otp.enum';
import { OtpRepository, UserDocument, UserRepository } from 'src/DB';
import { TokenService } from 'src/common/services/token.service';
import { emailEvent } from 'src/common/utils/email/email.event';
import {
  ConfirmEmailDto,
  LoginBodyDto,
  ResendEmailDto,
  SignupBodyDto,
} from './dto/signup.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly securityService: SecurityService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  private async createConfirmOtp(userId: Types.ObjectId, email: string) {
    const otpCode = createNumericalOtp();
    
    await this.otpRepository.create({
      data: [
        {
          code: otpCode,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.ConfirmEmail,
        },
      ],
    });
    
    emailEvent.emit(OtpEnum.ConfirmEmail, { to: email, otp: otpCode });
  }

  async signup(data: SignupBodyDto): Promise<string> {
    const { email, password, username } = data;
    
    const checkUserExist = await this.userRepository.findOne({
      filter: { email },
    });
    
    if (checkUserExist) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.securityService.generateHash(password);
    
    const [user] = await this.userRepository.create({
      data: [{ 
        email, 
        password: hashedPassword, 
        username,
        provider: ProviderEnum.SYSTEM 
      }],
    });

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    await this.createConfirmOtp(user._id, email);
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

    await this.createConfirmOtp(user._id, email);
    return 'Done';
  }

  async confirmEmail(data: ConfirmEmailDto): Promise<string> {
  const { email, code } = data;
  
  const user = await this.userRepository.findOne({
    filter: { email, confirmedAt: { $exists: false } },
  });

  if (!user) {
    throw new NotFoundException(
      'Failed to find unconfirmed user with this email',
    );
  }

  // Query OTP directly instead of using populate
  const otpRecord = await this.otpRepository.findOne({
    filter: { 
      createdBy: user._id, 
      type: OtpEnum.ConfirmEmail 
    },
  });

  if (!otpRecord) {
    throw new BadRequestException('No OTP found for this user');
  }

  // Check if OTP has expired
  if (otpRecord.expiresAt < new Date()) {
    // Auto-delete expired OTP
    await this.otpRepository.deleteOne({
      filter: { _id: otpRecord._id },
    });
    throw new BadRequestException('OTP has expired');
  }

  const isOtpValid = await this.securityService.compareHash(
    code, 
    otpRecord.code
  );

  if (!isOtpValid) {
    throw new BadRequestException('Invalid OTP code');
  }

  await this.userRepository.updateOne({
    filter: { _id: user._id },
    update: { confirmedAt: new Date() },
  });

  await this.otpRepository.deleteOne({
    filter: { _id: otpRecord._id },
  });

  return 'Done';
}

  async login(data: LoginBodyDto): Promise<LoginCredentialsResponse> {
    const { email, password } = data;
    
    const user = await this.userRepository.findOne({
      filter: { 
        email, 
        confirmedAt: { $exists: true }, 
        provider: ProviderEnum.SYSTEM 
      },
    });

    if (!user) {
      throw new NotFoundException('User not found or not confirmed');
    }

    const isPasswordValid = await this.securityService.compareHash(
      password, 
      user.password
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Failed to find user with provided credentials');
    }

    return await this.tokenService.loginCredentials(user as UserDocument);
  }

}