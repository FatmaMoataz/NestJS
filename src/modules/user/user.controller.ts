import { Controller, Get, Headers, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser, RoleEnum, TokenEnum } from 'src/common';
import type { UserDocument } from 'src/DB';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { delay, Observable, of } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user], TokenEnum.access)
  @Get()
  profile(
    @Headers() header:any,
    @User() user: UserDocument):Observable<any> {
    return of([{message:'Done'}]).pipe(delay(15000));
  }

  @Get()
  allUsers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.UserService.allUsers();
    return { message: 'done', data: { users } };
  }
}
