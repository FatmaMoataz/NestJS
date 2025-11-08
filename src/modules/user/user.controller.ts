import { Controller, Get, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, RoleEnum, TokenEnum } from 'src/common';
import { UserDocument } from 'src/DB';
import { JwtPayload } from 'jsonwebtoken';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  // @Token(TokenEnum.refresh)
@Auth([RoleEnum.admin , RoleEnum.user] , TokenEnum.access)
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
