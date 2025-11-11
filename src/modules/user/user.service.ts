import { Injectable } from '@nestjs/common';
import { IUser, S3Service, StorageEnum } from 'src/common';
import { UserDocument } from 'src/DB';

@Injectable()
export class UserService {
  constructor(private readonly s3Service: S3Service) {}

  allUsers(): IUser[] {
    return [{ id: 2, username: 'John', email: 'fffff', password: 'hhhh' }];
  }

  async profileImage(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<string> {
    user.profilePicture = await this.s3Service.uploadFile({
      file,
      storageApproach:StorageEnum.disk,
      path: `user/${user._id.toString()}`,
    });
    await user.save();
    return user.profilePicture;
  }
}
