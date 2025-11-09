import {
  Controller,
  Get,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { type IMulterFile, IUser, RoleEnum, TokenEnum } from 'src/common';
import type { UserDocument } from 'src/DB';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { delay, Observable, of } from 'rxjs';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation, localFileUpload } from 'src/common/utils/multer';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user], TokenEnum.access)
  @Get()
  profile(@Headers() header: any, @User() user: UserDocument): Observable<any> {
    return of([{ message: 'Done' }]).pipe(delay(15000));
  }

  @Get()
  allUsers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.UserService.allUsers();
    return { message: 'done', data: { users } };
  }

  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      cloudFileUpload({ validation: fileValidation.image }),
    ),
  )
  @Auth([RoleEnum.user], TokenEnum.access)
  @Patch('profile-image')
  profileImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: IMulterFile,
  ) {
    return { message: 'Done', file };
  }

    @UseInterceptors(
    FilesInterceptor(
      'coverImages',
      2,
      localFileUpload({ folder: 'User', validation: fileValidation.image }),
    ),
  )
  @Auth([RoleEnum.user], TokenEnum.access)
  @Patch('cover-image')
  coverImage(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    files: Array<IMulterFile>,
  ) {
    return { message: 'Done', files };
  }
  
      @UseInterceptors(
    FileFieldsInterceptor(
      [{name:"profileImage" , maxCount:1} , {name:"coverImage" , maxCount:2}],
      localFileUpload({ folder: 'User', validation: fileValidation.image }),
    ),
  )
  @Auth([RoleEnum.user], TokenEnum.access)
  @Patch('image')
  image(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    files: {
      profileImage:Array<IMulterFile>;
      coverImage:Array<IMulterFile>
    },
  ) {
    return { message: 'Done', files };
  }
}
