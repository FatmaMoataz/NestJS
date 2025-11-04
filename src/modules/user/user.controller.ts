import { Controller, Get, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, TokenEnum } from 'src/common';
import { UserDocument } from 'src/DB';
import { JwtPayload } from 'jsonwebtoken';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { Token } from 'src/common/decorators';

@UseGuards(AuthenticationGuard)
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  // @Token(TokenEnum.refresh)

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
