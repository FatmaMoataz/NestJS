import { IUser } from 'src/common/interfaces';
import { SignupBodyDto } from './dto/signup.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserRepository } from 'src/DB';
import { SecurityService } from 'src/common';

export class AuthenticationService {
  private users: IUser[] = [];
  constructor(
    private readonly userRepository: UserRepository,
    private readonly securityService: SecurityService,
  ) {}

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
    return 'Done';
  }
}
