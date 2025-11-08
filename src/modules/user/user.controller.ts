import { Controller, Get, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, RoleEnum, TokenEnum } from 'src/common';
import type{ UserDocument } from 'src/DB';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

@Auth([RoleEnum.admin , RoleEnum.user] , TokenEnum.access)
  @Get()  
  profile(
  @User() user: UserDocument
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
