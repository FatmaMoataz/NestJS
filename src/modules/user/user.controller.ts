import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from 'src/common';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Get()
  allUsers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.UserService.allUsers();
    return { message: 'done', data: { users } };
  }
}
