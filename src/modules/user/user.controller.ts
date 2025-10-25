import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from 'src/common';
import { UserDocument } from 'src/DB';
import { JwtPayload } from 'jsonwebtoken';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get()
  profile(
    @Req()
    req: Request & { credentials: { user: UserDocument; decoded: JwtPayload } },
  ): {
    message: string;
  } {
    return { message: 'done' };
  }

  @Get()
  allUsers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.UserService.allUsers();
    return { message: 'done', data: { users } };
  }
}
